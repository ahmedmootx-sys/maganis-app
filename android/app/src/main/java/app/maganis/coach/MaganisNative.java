package app.maganis.coach;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.content.pm.SigningInfo;
import android.os.Build;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "MaganisNative")
public class MaganisNative extends Plugin {

    private DurableFileStore kvStore;
    private DurableFileStore mediaStore;
    private final ExecutorService writeExecutor = Executors.newSingleThreadExecutor();

    // In-flight chunked uploads buffer: key -> (chunkIndex -> chunkData)
    private final ConcurrentHashMap<String, Map<Integer, String>> chunkBuffers = new ConcurrentHashMap<>();

    @Override
    public void load() {
        super.load();
        Context ctx = getContext();
        File baseKvDir = new File(ctx.getFilesDir(), "maganis/kv");
        File baseMediaDir = new File(ctx.getFilesDir(), "maganis/media");
        kvStore = new DurableFileStore(baseKvDir);
        mediaStore = new DurableFileStore(baseMediaDir);
    }

    @PluginMethod
    public void getInfo(PluginCall call) {
        Context context = getContext();
        PackageManager pm = context.getPackageManager();
        String packageName = context.getPackageName();

        JSObject ret = new JSObject();
        ret.put("applicationId", packageName);

        try {
            PackageInfo pInfo;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                pInfo = pm.getPackageInfo(packageName, PackageManager.GET_SIGNING_CERTIFICATES);
            } else {
                pInfo = pm.getPackageInfo(packageName, PackageManager.GET_SIGNATURES);
            }

            ret.put("versionName", pInfo.versionName != null ? pInfo.versionName : "unknown");

            long versionCode;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                versionCode = pInfo.getLongVersionCode();
            } else {
                versionCode = pInfo.versionCode;
            }
            ret.put("versionCode", versionCode);

            ApplicationInfo appInfo = context.getApplicationInfo();
            boolean isDebuggable = (appInfo.flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
            ret.put("debuggable", isDebuggable);
            ret.put("buildType", isDebuggable ? "debug" : "release");
            ret.put("sdkInt", Build.VERSION.SDK_INT);
            ret.put("deviceModel", Build.MANUFACTURER + " " + Build.MODEL);

            String certSha256 = extractSigningCertificateSha256(pInfo);
            ret.put("signingSha256", certSha256);

            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to retrieve native info: " + e.getMessage(), e);
        }
    }

    private String extractSigningCertificateSha256(PackageInfo pInfo) {
        try {
            Signature[] signatures = null;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                SigningInfo signingInfo = pInfo.signingInfo;
                if (signingInfo != null) {
                    if (signingInfo.hasMultipleSigners()) {
                        signatures = signingInfo.getApkContentsSigners();
                    } else {
                        signatures = signingInfo.getSigningCertificateHistory();
                    }
                }
            } else {
                signatures = pInfo.signatures;
            }

            if (signatures == null || signatures.length == 0) {
                return "unavailable";
            }

            byte[] cert = signatures[0].toByteArray();
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(cert);

            StringBuilder hex = new StringBuilder();
            for (byte b : digest) {
                hex.append(String.format("%02X", b));
            }
            return hex.toString();
        } catch (Exception e) {
            return "error: " + e.getMessage();
        }
    }

    // --- Durable KV Methods ---

    @PluginMethod
    public void kvReadAll(PluginCall call) {
        writeExecutor.submit(() -> {
            try {
                DurableFileStore.ReadResult result = kvStore.readAll();
                JSObject ret = new JSObject();

                JSObject dataObj = new JSObject();
                for (Map.Entry<String, String> entry : result.data.entrySet()) {
                    dataObj.put(entry.getKey(), entry.getValue());
                }
                ret.put("data", dataObj);

                JSArray eventsArr = new JSArray();
                for (DurableFileStore.RecoveryEvent ev : result.recoveryEvents) {
                    JSObject evObj = new JSObject();
                    evObj.put("key", ev.key);
                    evObj.put("recoveredFrom", ev.recoveredFrom);
                    evObj.put("reason", ev.reason);
                    evObj.put("timestamp", ev.timestamp);
                    eventsArr.put(evObj);
                }
                ret.put("recoveryEvents", eventsArr);

                call.resolve(ret);
            } catch (Exception e) {
                call.reject("kvReadAll failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void kvWrite(PluginCall call) {
        String key = call.getString("key");
        String value = call.getString("value");

        if (key == null || value == null) {
            call.reject("Missing key or value");
            return;
        }

        writeExecutor.submit(() -> {
            try {
                kvStore.write(key, value);
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("key", key);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("kvWrite failed for key '" + key + "': " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void kvWriteChunk(PluginCall call) {
        String key = call.getString("key");
        Integer chunkIndex = call.getInt("chunkIndex");
        Integer totalChunks = call.getInt("totalChunks");
        String chunkData = call.getString("chunkData");

        if (key == null || chunkIndex == null || totalChunks == null || chunkData == null) {
            call.reject("Missing chunk metadata (key, chunkIndex, totalChunks, chunkData)");
            return;
        }

        writeExecutor.submit(() -> {
            try {
                Map<Integer, String> buffer = chunkBuffers.computeIfAbsent(key, k -> new HashMap<>());
                buffer.put(chunkIndex, chunkData);

                if (buffer.size() == totalChunks) {
                    // All chunks arrived, assemble full value
                    StringBuilder fullValue = new StringBuilder();
                    for (int i = 0; i < totalChunks; i++) {
                        String part = buffer.get(i);
                        if (part == null) {
                            throw new IllegalStateException("Missing chunk " + i + " for key " + key);
                        }
                        fullValue.append(part);
                    }
                    chunkBuffers.remove(key);

                    kvStore.write(key, fullValue.toString());
                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    ret.put("key", key);
                    ret.put("chunksAssembled", totalChunks);
                    call.resolve(ret);
                } else {
                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    ret.put("chunkReceived", chunkIndex);
                    ret.put("remaining", totalChunks - buffer.size());
                    call.resolve(ret);
                }
            } catch (Exception e) {
                chunkBuffers.remove(key);
                call.reject("kvWriteChunk failed for key '" + key + "': " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void kvRemove(PluginCall call) {
        String key = call.getString("key");
        if (key == null) {
            call.reject("Missing key");
            return;
        }

        writeExecutor.submit(() -> {
            try {
                kvStore.remove(key);
                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("kvRemove failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void kvClear(PluginCall call) {
        writeExecutor.submit(() -> {
            try {
                kvStore.clear();
                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("kvClear failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void kvStats(PluginCall call) {
        try {
            DurableFileStore.StoreStats stats = kvStore.stats();
            JSObject ret = new JSObject();
            ret.put("keyCount", stats.keyCount);
            ret.put("totalBytes", stats.totalBytes);
            ret.put("freeSpaceBytes", stats.freeSpaceBytes);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("kvStats failed: " + e.getMessage(), e);
        }
    }

    // --- Durable Media Methods ---

    @PluginMethod
    public void mediaGet(PluginCall call) {
        String id = call.getString("id");
        if (id == null) {
            call.reject("Missing media id");
            return;
        }

        writeExecutor.submit(() -> {
            try {
                String payload = mediaStore.read(id);
                if (payload == null) {
                    call.resolve(new JSObject()); // empty = null
                    return;
                }
                JSObject ret = new JSObject(payload);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("mediaGet failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void mediaSet(PluginCall call) {
        String id = call.getString("id");
        String mime = call.getString("mime");
        String dataUrl = call.getString("dataUrl");

        if (id == null || mime == null || dataUrl == null) {
            call.reject("Missing id, mime, or dataUrl");
            return;
        }

        writeExecutor.submit(() -> {
            try {
                JSObject obj = new JSObject();
                obj.put("mime", mime);
                obj.put("dataUrl", dataUrl);
                mediaStore.write(id, obj.toString());

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("id", id);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("mediaSet failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void mediaRemove(PluginCall call) {
        String id = call.getString("id");
        if (id == null) {
            call.reject("Missing media id");
            return;
        }

        writeExecutor.submit(() -> {
            try {
                mediaStore.remove(id);
                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("mediaRemove failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void mediaGetAll(PluginCall call) {
        writeExecutor.submit(() -> {
            try {
                DurableFileStore.ReadResult result = mediaStore.readAll();
                JSObject ret = new JSObject();
                JSObject items = new JSObject();
                for (Map.Entry<String, String> entry : result.data.entrySet()) {
                    try {
                        items.put(entry.getKey(), new JSObject(entry.getValue()));
                    } catch (Exception ignored) {
                    }
                }
                ret.put("items", items);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("mediaGetAll failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void mediaUsage(PluginCall call) {
        try {
            DurableFileStore.StoreStats stats = mediaStore.stats();
            JSObject ret = new JSObject();
            ret.put("count", stats.keyCount);
            ret.put("totalBytes", stats.totalBytes);
            ret.put("freeSpaceBytes", stats.freeSpaceBytes);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("mediaUsage failed: " + e.getMessage(), e);
        }
    }
}
