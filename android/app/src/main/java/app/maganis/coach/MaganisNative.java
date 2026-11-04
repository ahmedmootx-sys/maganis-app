package app.maganis.coach;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.ApplicationExitInfo;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.UriPermission;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.content.pm.SigningInfo;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.provider.Settings;
import android.util.Base64;
import android.view.WindowManager;

import androidx.activity.result.ActivityResult;
import androidx.core.content.FileProvider;
import androidx.documentfile.provider.DocumentFile;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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

    // Streaming write/read states
    private static class WriteStreamState {
        final OutputStream os;
        final File tmpFile;
        final File finalFile;
        final BackupStorageManager.IncrementalHasher hasher;
        final String target;
        final Uri uri;

        WriteStreamState(OutputStream os, File tmpFile, File finalFile,
                         BackupStorageManager.IncrementalHasher hasher,
                         String target, Uri uri) {
            this.os = os;
            this.tmpFile = tmpFile;
            this.finalFile = finalFile;
            this.hasher = hasher;
            this.target = target;
            this.uri = uri;
        }
    }

    private static class ReadStreamState {
        final InputStream is;
        final long totalSize;

        ReadStreamState(InputStream is, long totalSize) {
            this.is = is;
            this.totalSize = totalSize;
        }
    }

    private final ConcurrentHashMap<String, WriteStreamState> writeStreams = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, ReadStreamState> readStreams = new ConcurrentHashMap<>();

    @Override
    public void load() {
        super.load();
        Context ctx = getContext();
        File baseKvDir = new File(ctx.getFilesDir(), "maganis/kv");
        File baseMediaDir = new File(ctx.getFilesDir(), "maganis/media");
        kvStore = new DurableFileStore(baseKvDir);
        mediaStore = new DurableFileStore(baseMediaDir);

        File snapshotsDir = new File(ctx.getFilesDir(), "maganis/snapshots/auto");
        if (!snapshotsDir.exists()) {
            snapshotsDir.mkdirs();
        }
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

    // --- Task N3: Streaming Backup API ---

    @PluginMethod
    public void openWrite(PluginCall call) {
        String target = call.getString("target", "internal");
        String name = call.getString("name");
        String mime = call.getString("mime", "application/json");
        String folderUri = call.getString("folderUri");

        if (name == null || name.trim().isEmpty()) {
            call.reject("Missing file name");
            return;
        }

        if (!BackupStorageManager.isValidBackupFileName(name)) {
            call.reject("Invalid backup file name pattern: " + name);
            return;
        }

        writeExecutor.submit(() -> {
            try {
                String handle = UUID.randomUUID().toString();
                BackupStorageManager.IncrementalHasher hasher = new BackupStorageManager.IncrementalHasher();
                Context ctx = getContext();

                if ("internal".equals(target) || "saveAs".equals(target)) {
                    File dir = new File(ctx.getFilesDir(), "maganis/snapshots/auto");
                    if (!dir.exists()) {
                        dir.mkdirs();
                    }
                    File tmpFile = new File(dir, name + ".tmp");
                    File finalFile = new File(dir, name);
                    FileOutputStream fos = new FileOutputStream(tmpFile);
                    writeStreams.put(handle, new WriteStreamState(fos, tmpFile, finalFile, hasher, target, null));

                    JSObject ret = new JSObject();
                    ret.put("handle", handle);
                    call.resolve(ret);
                } else if ("downloads".equals(target)) {
                    if (Build.VERSION.SDK_INT < 29) {
                        call.reject("Auto backup to Downloads is unsupported on Android 9 and older (API < 29)");
                        return;
                    }

                    ContentResolver resolver = ctx.getContentResolver();
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
                    values.put(MediaStore.MediaColumns.MIME_TYPE, mime);
                    values.put(MediaStore.MediaColumns.RELATIVE_PATH, "Download/Maganis/");
                    values.put(MediaStore.MediaColumns.IS_PENDING, 1);

                    Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri == null) {
                        call.reject("Failed to create MediaStore entry in Download/Maganis/");
                        return;
                    }

                    OutputStream os = resolver.openOutputStream(uri, "wt");
                    if (os == null) {
                        resolver.delete(uri, null, null);
                        call.reject("Failed to open MediaStore output stream for " + uri);
                        return;
                    }

                    writeStreams.put(handle, new WriteStreamState(os, null, null, hasher, target, uri));
                    JSObject ret = new JSObject();
                    ret.put("handle", handle);
                    ret.put("uri", uri.toString());
                    call.resolve(ret);
                } else if ("folder".equals(target)) {
                    if (folderUri == null || folderUri.trim().isEmpty()) {
                        call.reject("Missing folderUri for target 'folder'");
                        return;
                    }

                    Uri treeUri = Uri.parse(folderUri);
                    DocumentFile root = DocumentFile.fromTreeUri(ctx, treeUri);
                    if (root == null || !root.canWrite()) {
                        call.reject("Cannot write to selected folder (permission lost or invalid)");
                        return;
                    }

                    DocumentFile doc = root.createFile(mime, name);
                    if (doc == null) {
                        call.reject("Failed to create document in selected folder");
                        return;
                    }

                    OutputStream os = ctx.getContentResolver().openOutputStream(doc.getUri(), "wt");
                    if (os == null) {
                        call.reject("Failed to open document stream for " + doc.getUri());
                        return;
                    }

                    writeStreams.put(handle, new WriteStreamState(os, null, null, hasher, target, doc.getUri()));
                    JSObject ret = new JSObject();
                    ret.put("handle", handle);
                    ret.put("uri", doc.getUri().toString());
                    call.resolve(ret);
                } else {
                    call.reject("Unsupported write target: " + target);
                }
            } catch (Exception e) {
                call.reject("openWrite failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void append(PluginCall call) {
        String handle = call.getString("handle");
        String chunkBase64 = call.getString("chunkBase64");

        if (handle == null || chunkBase64 == null) {
            call.reject("Missing handle or chunkBase64");
            return;
        }

        WriteStreamState state = writeStreams.get(handle);
        if (state == null) {
            call.reject("Invalid or closed write handle: " + handle);
            return;
        }

        writeExecutor.submit(() -> {
            try {
                byte[] chunk = Base64.decode(chunkBase64, Base64.NO_WRAP);
                state.os.write(chunk);
                state.hasher.update(chunk);

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("bytesWritten", chunk.length);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("append failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void close(PluginCall call) {
        String handle = call.getString("handle");
        if (handle == null) {
            call.reject("Missing handle");
            return;
        }

        WriteStreamState state = writeStreams.remove(handle);
        if (state == null) {
            call.reject("Invalid or already closed handle: " + handle);
            return;
        }

        writeExecutor.submit(() -> {
            try {
                state.os.flush();
                if (state.os instanceof FileOutputStream) {
                    ((FileOutputStream) state.os).getFD().sync();
                }
                state.os.close();

                Context ctx = getContext();
                if ("internal".equals(state.target) || "saveAs".equals(state.target)) {
                    if (state.tmpFile != null && state.finalFile != null) {
                        if (state.finalFile.exists()) {
                            state.finalFile.delete();
                        }
                        boolean ok = state.tmpFile.renameTo(state.finalFile);
                        if (!ok) {
                            throw new IllegalStateException("Failed to atomically rename tmp snapshot file to " + state.finalFile.getName());
                        }
                    }
                } else if ("downloads".equals(state.target) && state.uri != null) {
                    if (Build.VERSION.SDK_INT >= 29) {
                        ContentValues values = new ContentValues();
                        values.put(MediaStore.MediaColumns.IS_PENDING, 0);
                        ctx.getContentResolver().update(state.uri, values, null, null);
                    }
                }

                BackupStorageManager.VerifyResult verify = state.hasher.finish();
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("bytes", verify.bytes);
                ret.put("sha256", verify.sha256);
                if (state.uri != null) {
                    ret.put("uri", state.uri.toString());
                }
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("close failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void abort(PluginCall call) {
        String handle = call.getString("handle");
        if (handle == null) {
            call.reject("Missing handle");
            return;
        }

        WriteStreamState state = writeStreams.remove(handle);
        if (state == null) {
            call.resolve(new JSObject());
            return;
        }

        writeExecutor.submit(() -> {
            try {
                try {
                    state.os.close();
                } catch (Exception ignored) {
                }

                if (state.tmpFile != null && state.tmpFile.exists()) {
                    state.tmpFile.delete();
                }

                if (state.uri != null) {
                    getContext().getContentResolver().delete(state.uri, null, null);
                }

                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("abort failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void openRead(PluginCall call) {
        String target = call.getString("target", "internal");
        String name = call.getString("name");
        String uriStr = call.getString("uri");

        writeExecutor.submit(() -> {
            try {
                Context ctx = getContext();
                InputStream is = null;
                long totalSize = 0;

                if (uriStr != null && !uriStr.trim().isEmpty()) {
                    Uri uri = Uri.parse(uriStr);
                    is = ctx.getContentResolver().openInputStream(uri);
                    try (Cursor c = ctx.getContentResolver().query(uri, null, null, null, null)) {
                        if (c != null && c.moveToFirst()) {
                            int sizeIndex = c.getColumnIndex(MediaStore.MediaColumns.SIZE);
                            if (sizeIndex != -1) {
                                totalSize = c.getLong(sizeIndex);
                            }
                        }
                    } catch (Exception ignored) {
                    }
                } else if ("internal".equals(target)) {
                    if (name == null) {
                        call.reject("Missing name for internal read");
                        return;
                    }
                    File dir = new File(ctx.getFilesDir(), "maganis/snapshots/auto");
                    File f = new File(dir, name);
                    if (!f.exists()) {
                        call.reject("Internal backup file not found: " + name);
                        return;
                    }
                    totalSize = f.length();
                    is = new FileInputStream(f);
                } else if ("downloads".equals(target)) {
                    if (name == null) {
                        call.reject("Missing name for downloads read");
                        return;
                    }
                    if (Build.VERSION.SDK_INT >= 29) {
                        ContentResolver resolver = ctx.getContentResolver();
                        Uri contentUri = MediaStore.Downloads.EXTERNAL_CONTENT_URI;
                        String selection = MediaStore.MediaColumns.DISPLAY_NAME + " = ? AND " +
                                MediaStore.MediaColumns.RELATIVE_PATH + " LIKE ?";
                        String[] selectionArgs = new String[]{name, "Download/Maganis%"};
                        try (Cursor cursor = resolver.query(contentUri, null, selection, selectionArgs, null)) {
                            if (cursor != null && cursor.moveToFirst()) {
                                int idIndex = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns._ID);
                                long id = cursor.getLong(idIndex);
                                Uri fileUri = Uri.withAppendedPath(contentUri, String.valueOf(id));
                                is = resolver.openInputStream(fileUri);
                                int sizeIndex = cursor.getColumnIndex(MediaStore.MediaColumns.SIZE);
                                if (sizeIndex != -1) {
                                    totalSize = cursor.getLong(sizeIndex);
                                }
                            }
                        }
                    }
                }

                if (is == null) {
                    call.reject("Could not locate or open file for read");
                    return;
                }

                String handle = UUID.randomUUID().toString();
                readStreams.put(handle, new ReadStreamState(is, totalSize));

                JSObject ret = new JSObject();
                ret.put("handle", handle);
                ret.put("size", totalSize);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("openRead failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void readChunk(PluginCall call) {
        String handle = call.getString("handle");
        int length = call.getInt("length", 262144); // 256 KB default

        if (handle == null) {
            call.reject("Missing handle");
            return;
        }

        ReadStreamState state = readStreams.get(handle);
        if (state == null) {
            call.reject("Invalid or closed read handle");
            return;
        }

        writeExecutor.submit(() -> {
            try {
                byte[] buf = new byte[length];
                int r = state.is.read(buf);
                JSObject ret = new JSObject();
                if (r > 0) {
                    String base64 = Base64.encodeToString(buf, 0, r, Base64.NO_WRAP);
                    ret.put("chunkBase64", base64);
                    ret.put("bytesRead", r);
                    ret.put("eof", false);
                } else {
                    ret.put("chunkBase64", "");
                    ret.put("bytesRead", 0);
                    ret.put("eof", true);
                }
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("readChunk failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void closeRead(PluginCall call) {
        String handle = call.getString("handle");
        if (handle == null) {
            call.reject("Missing handle");
            return;
        }

        ReadStreamState state = readStreams.remove(handle);
        if (state == null) {
            call.resolve(new JSObject());
            return;
        }

        try {
            state.is.close();
        } catch (Exception ignored) {
        }

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void verify(PluginCall call) {
        String target = call.getString("target", "internal");
        String name = call.getString("name");
        String uriStr = call.getString("uri");

        writeExecutor.submit(() -> {
            try {
                Context ctx = getContext();
                InputStream is = null;

                if (uriStr != null && !uriStr.trim().isEmpty()) {
                    is = ctx.getContentResolver().openInputStream(Uri.parse(uriStr));
                } else if ("internal".equals(target)) {
                    if (name == null) {
                        call.reject("Missing file name for verification");
                        return;
                    }
                    File f = new File(new File(ctx.getFilesDir(), "maganis/snapshots/auto"), name);
                    if (!f.exists()) {
                        call.reject("Internal file not found for verification: " + name);
                        return;
                    }
                    is = new FileInputStream(f);
                } else if ("downloads".equals(target)) {
                    if (name == null) {
                        call.reject("Missing file name for verification");
                        return;
                    }
                    if (Build.VERSION.SDK_INT >= 29) {
                        ContentResolver resolver = ctx.getContentResolver();
                        Uri contentUri = MediaStore.Downloads.EXTERNAL_CONTENT_URI;
                        String selection = MediaStore.MediaColumns.DISPLAY_NAME + " = ? AND " +
                                MediaStore.MediaColumns.RELATIVE_PATH + " LIKE ?";
                        String[] selectionArgs = new String[]{name, "Download/Maganis%"};
                        try (Cursor cursor = resolver.query(contentUri, null, selection, selectionArgs, null)) {
                            if (cursor != null && cursor.moveToFirst()) {
                                int idIndex = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns._ID);
                                long id = cursor.getLong(idIndex);
                                Uri fileUri = Uri.withAppendedPath(contentUri, String.valueOf(id));
                                is = resolver.openInputStream(fileUri);
                            }
                        }
                    }
                }

                if (is == null) {
                    call.reject("Could not locate file to verify: target=" + target + ", name=" + name);
                    return;
                }

                try (InputStream streamToVerify = is) {
                    BackupStorageManager.VerifyResult res = BackupStorageManager.calculateStreamDigest(streamToVerify);
                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    ret.put("bytes", res.bytes);
                    ret.put("sha256", res.sha256);
                    call.resolve(ret);
                }
            } catch (Exception e) {
                call.reject("verify failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void list(PluginCall call) {
        String target = call.getString("target", "internal");
        String folderUri = call.getString("folderUri");

        writeExecutor.submit(() -> {
            try {
                Context ctx = getContext();
                JSArray filesArray = new JSArray();

                if ("internal".equals(target)) {
                    File dir = new File(ctx.getFilesDir(), "maganis/snapshots/auto");
                    File[] list = dir.listFiles();
                    if (list != null) {
                        for (File f : list) {
                            if (f.isFile() && BackupStorageManager.isValidBackupFileName(f.getName())) {
                                boolean isOwn = BackupStorageManager.hasSnapshotMarker(f);
                                JSObject item = new JSObject();
                                item.put("name", f.getName());
                                item.put("size", f.length());
                                item.put("modified", f.lastModified());
                                item.put("isOwn", isOwn);
                                filesArray.put(item);
                            }
                        }
                    }
                } else if ("downloads".equals(target)) {
                    if (Build.VERSION.SDK_INT >= 29) {
                        ContentResolver resolver = ctx.getContentResolver();
                        Uri contentUri = MediaStore.Downloads.EXTERNAL_CONTENT_URI;
                        String selection = MediaStore.MediaColumns.RELATIVE_PATH + " LIKE ?";
                        String[] selectionArgs = new String[]{"Download/Maganis%"};
                        try (Cursor cursor = resolver.query(contentUri, null, selection, selectionArgs, MediaStore.MediaColumns.DATE_MODIFIED + " DESC")) {
                            if (cursor != null) {
                                int nameIdx = cursor.getColumnIndex(MediaStore.MediaColumns.DISPLAY_NAME);
                                int sizeIdx = cursor.getColumnIndex(MediaStore.MediaColumns.SIZE);
                                int modIdx = cursor.getColumnIndex(MediaStore.MediaColumns.DATE_MODIFIED);
                                int idIdx = cursor.getColumnIndex(MediaStore.MediaColumns._ID);

                                while (cursor.moveToNext()) {
                                    String name = cursor.getString(nameIdx);
                                    if (BackupStorageManager.isValidBackupFileName(name)) {
                                        long size = sizeIdx != -1 ? cursor.getLong(sizeIdx) : 0;
                                        long mod = modIdx != -1 ? cursor.getLong(modIdx) * 1000L : System.currentTimeMillis();
                                        long id = cursor.getLong(idIdx);
                                        Uri itemUri = Uri.withAppendedPath(contentUri, String.valueOf(id));

                                        boolean isOwn = true;
                                        try (InputStream is = resolver.openInputStream(itemUri)) {
                                            isOwn = is != null && BackupStorageManager.hasSnapshotMarker(is);
                                        } catch (Exception ignored) {
                                        }

                                        JSObject item = new JSObject();
                                        item.put("name", name);
                                        item.put("size", size);
                                        item.put("modified", mod);
                                        item.put("isOwn", isOwn);
                                        item.put("uri", itemUri.toString());
                                        filesArray.put(item);
                                    }
                                }
                            }
                        }
                    }
                } else if ("folder".equals(target)) {
                    if (folderUri != null && !folderUri.trim().isEmpty()) {
                        DocumentFile root = DocumentFile.fromTreeUri(ctx, Uri.parse(folderUri));
                        if (root != null && root.isDirectory()) {
                            for (DocumentFile df : root.listFiles()) {
                                String name = df.getName();
                                if (df.isFile() && BackupStorageManager.isValidBackupFileName(name)) {
                                    boolean isOwn = false;
                                    try (InputStream is = ctx.getContentResolver().openInputStream(df.getUri())) {
                                        isOwn = is != null && BackupStorageManager.hasSnapshotMarker(is);
                                    } catch (Exception ignored) {
                                    }

                                    JSObject item = new JSObject();
                                    item.put("name", name);
                                    item.put("size", df.length());
                                    item.put("modified", df.lastModified());
                                    item.put("isOwn", isOwn);
                                    item.put("uri", df.getUri().toString());
                                    filesArray.put(item);
                                }
                            }
                        }
                    }
                }

                JSObject ret = new JSObject();
                ret.put("files", filesArray);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("list failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void delete(PluginCall call) {
        String target = call.getString("target", "internal");
        String name = call.getString("name");
        String uriStr = call.getString("uri");

        if (name != null && !BackupStorageManager.isValidBackupFileName(name)) {
            call.reject("Security: Will not delete file that does not match backup pattern: " + name);
            return;
        }

        writeExecutor.submit(() -> {
            try {
                Context ctx = getContext();
                boolean deleted = false;

                if (uriStr != null && !uriStr.trim().isEmpty()) {
                    int rows = ctx.getContentResolver().delete(Uri.parse(uriStr), null, null);
                    deleted = rows > 0;
                } else if ("internal".equals(target)) {
                    File f = new File(new File(ctx.getFilesDir(), "maganis/snapshots/auto"), name);
                    if (f.exists()) {
                        if (!BackupStorageManager.hasSnapshotMarker(f)) {
                            call.reject("Security: Foreign file without snapshot marker cannot be deleted");
                            return;
                        }
                        deleted = f.delete();
                    }
                } else if ("downloads".equals(target)) {
                    if (Build.VERSION.SDK_INT >= 29) {
                        ContentResolver resolver = ctx.getContentResolver();
                        Uri contentUri = MediaStore.Downloads.EXTERNAL_CONTENT_URI;
                        String selection = MediaStore.MediaColumns.DISPLAY_NAME + " = ? AND " +
                                MediaStore.MediaColumns.RELATIVE_PATH + " LIKE ?";
                        String[] selectionArgs = new String[]{name, "Download/Maganis%"};
                        int rows = resolver.delete(contentUri, selection, selectionArgs);
                        deleted = rows > 0;
                    }
                }

                JSObject ret = new JSObject();
                ret.put("success", deleted);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("delete failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void shareFile(PluginCall call) {
        String name = call.getString("name");
        String target = call.getString("target", "internal");

        if (name == null || !BackupStorageManager.isValidBackupFileName(name)) {
            call.reject("Missing or invalid backup file name");
            return;
        }

        try {
            Context ctx = getContext();
            File file = new File(new File(ctx.getFilesDir(), "maganis/snapshots/auto"), name);
            if (!file.exists()) {
                call.reject("Backup file not found to share: " + name);
                return;
            }

            Uri contentUri = FileProvider.getUriForFile(ctx, ctx.getPackageName() + ".fileprovider", file);

            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("application/json");
            shareIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
            shareIntent.putExtra(Intent.EXTRA_SUBJECT, name);
            shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            Intent chooser = Intent.createChooser(shareIntent, "مشاركة النسخة الاحتياطية");
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(chooser);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("shareFile failed: " + e.getMessage(), e);
        }
    }

    // --- L5 & Save As Storage Access Framework (SAF) ---

    @PluginMethod
    public void pickFolder(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION
                | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        startActivityForResult(call, intent, "folderPickerResult");
    }

    @ActivityCallback
    private void folderPickerResult(PluginCall call, ActivityResult result) {
        if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
            Uri treeUri = result.getData().getData();
            if (treeUri != null) {
                try {
                    int takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION;
                    getContext().getContentResolver().takePersistableUriPermission(treeUri, takeFlags);

                    DocumentFile doc = DocumentFile.fromTreeUri(getContext(), treeUri);
                    String displayName = doc != null ? doc.getName() : treeUri.getLastPathSegment();

                    JSObject ret = new JSObject();
                    ret.put("uri", treeUri.toString());
                    ret.put("displayName", displayName != null ? displayName : "مجلد محدد");
                    call.resolve(ret);
                    return;
                } catch (Exception e) {
                    call.reject("Failed to persist folder permission: " + e.getMessage(), e);
                    return;
                }
            }
        }
        call.reject("Folder selection was cancelled by user");
    }

    @PluginMethod
    public void folderStatus(PluginCall call) {
        String uriStr = call.getString("uri");
        if (uriStr == null || uriStr.trim().isEmpty()) {
            call.reject("Missing folder uri");
            return;
        }

        try {
            Uri treeUri = Uri.parse(uriStr);
            Context ctx = getContext();

            // Check if permission is still held
            boolean permissionHeld = false;
            List<UriPermission> permissions = ctx.getContentResolver().getPersistedUriPermissions();
            for (UriPermission p : permissions) {
                if (p.getUri().equals(treeUri) && p.isWritePermission()) {
                    permissionHeld = true;
                    break;
                }
            }

            DocumentFile doc = DocumentFile.fromTreeUri(ctx, treeUri);
            boolean exists = doc != null && doc.exists();
            boolean writable = doc != null && doc.canWrite();
            String name = doc != null ? doc.getName() : "مجلد محدد";

            JSObject ret = new JSObject();
            ret.put("permissionHeld", permissionHeld);
            ret.put("exists", exists);
            ret.put("writable", writable && permissionHeld);
            ret.put("displayName", name);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("folderStatus failed: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void releaseFolder(PluginCall call) {
        String uriStr = call.getString("uri");
        if (uriStr == null || uriStr.trim().isEmpty()) {
            call.reject("Missing folder uri");
            return;
        }

        try {
            Uri treeUri = Uri.parse(uriStr);
            int flags = Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION;
            getContext().getContentResolver().releasePersistableUriPermission(treeUri, flags);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("releaseFolder failed: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void saveAs(PluginCall call) {
        String name = call.getString("name");
        String mime = call.getString("mime", "application/json");

        if (name == null || name.trim().isEmpty()) {
            call.reject("Missing name for saveAs");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mime);
        intent.putExtra(Intent.EXTRA_TITLE, name);

        startActivityForResult(call, intent, "saveAsResult");
    }

    @ActivityCallback
    private void saveAsResult(PluginCall call, ActivityResult result) {
        if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
            Uri docUri = result.getData().getData();
            if (docUri != null) {
                String sourceName = call.getString("sourceName");
                if (sourceName == null || sourceName.trim().isEmpty()) {
                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    ret.put("uri", docUri.toString());
                    call.resolve(ret);
                    return;
                }

                writeExecutor.submit(() -> {
                    try {
                        Context ctx = getContext();
                        File sourceFile = new File(new File(ctx.getFilesDir(), "maganis/snapshots/auto"), sourceName);
                        if (!sourceFile.exists()) {
                            call.reject("Source snapshot file not found: " + sourceName);
                            return;
                        }

                        try (InputStream in = new FileInputStream(sourceFile);
                             OutputStream out = ctx.getContentResolver().openOutputStream(docUri, "wt")) {
                            byte[] buf = new byte[16384];
                            int r;
                            long total = 0;
                            while ((r = in.read(buf)) != -1) {
                                out.write(buf, 0, r);
                                total += r;
                            }
                            out.flush();

                            JSObject ret = new JSObject();
                            ret.put("success", true);
                            ret.put("bytes", total);
                            ret.put("uri", docUri.toString());
                            call.resolve(ret);
                        }
                    } catch (Exception e) {
                        call.reject("Failed to copy snapshot to chosen document: " + e.getMessage(), e);
                    }
                });
                return;
            }
        }
        call.reject("Save As was cancelled by user");
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        String kind = call.getString("kind", "appNotifications");
        Intent intent;
        Context ctx = getContext();
        String pkg = ctx.getPackageName();

        if ("channel".equals(kind)) {
            String channelId = call.getString("channelId");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && channelId != null) {
                intent = new Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS);
                intent.putExtra(Settings.EXTRA_APP_PACKAGE, pkg);
                intent.putExtra(Settings.EXTRA_CHANNEL_ID, channelId);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                intent.putExtra(Settings.EXTRA_APP_PACKAGE, pkg);
            } else {
                intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.parse("package:" + pkg));
            }
        } else if ("exactAlarm".equals(kind)) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                intent.setData(Uri.parse("package:" + pkg));
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                intent.putExtra(Settings.EXTRA_APP_PACKAGE, pkg);
            } else {
                intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.parse("package:" + pkg));
            }
        } else if ("batteryOptimization".equals(kind)) {
            intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
        } else {
            // "appNotifications" default
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                intent.putExtra(Settings.EXTRA_APP_PACKAGE, pkg);
            } else {
                intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.parse("package:" + pkg));
            }
        }

        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            ctx.startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Could not open settings: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void getPowerStatus(PluginCall call) {
        PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
        boolean ignoring = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && pm != null) {
            ignoring = pm.isIgnoringBatteryOptimizations(getContext().getPackageName());
        }
        JSObject ret = new JSObject();
        ret.put("ignoringBatteryOptimizations", ignoring);
        call.resolve(ret);
    }

    @PluginMethod
    public void getChannelStatus(PluginCall call) {
        String channelId = call.getString("channelId");
        JSObject ret = new JSObject();
        if (channelId == null || channelId.isEmpty()) {
            call.reject("channelId is required");
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
            NotificationChannel channel = nm != null ? nm.getNotificationChannel(channelId) : null;
            if (channel != null) {
                int importance = channel.getImportance();
                ret.put("exists", true);
                ret.put("enabled", importance != NotificationManager.IMPORTANCE_NONE);
                ret.put("importance", importance);
            } else {
                ret.put("exists", false);
                ret.put("enabled", false);
                ret.put("importance", 0);
            }
        } else {
            ret.put("exists", true);
            ret.put("enabled", true);
            ret.put("importance", 3);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void keepScreenOn(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", true));
        Activity activity = getActivity();
        if (activity != null) {
            activity.runOnUiThread(() -> {
                if (activity.getWindow() != null) {
                    if (enabled) {
                        activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                    } else {
                        activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                    }
                }
            });
        }
        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("enabled", enabled);
        call.resolve(ret);
    }

    // =========================================================================
    // TASK N5: LOGS, DIAGNOSTICS, SAFE MODE & STABILITY
    // =========================================================================

    private static final long LOG_ROTATION_THRESHOLD_BYTES = 256 * 1024L; // 256 KB per log file
    private final Object logLock = new Object();

    @PluginMethod
    public void appendLog(PluginCall call) {
        String line = call.getString("line");
        if (line == null) {
            call.resolve();
            return;
        }

        writeExecutor.execute(() -> {
            synchronized (logLock) {
                try {
                    File logsDir = new File(getContext().getFilesDir(), "maganis/logs");
                    if (!logsDir.exists()) logsDir.mkdirs();

                    File currentLog = new File(logsDir, "app.log");
                    if (currentLog.exists() && currentLog.length() >= LOG_ROTATION_THRESHOLD_BYTES) {
                        File rotatedLog = new File(logsDir, "app.1.log");
                        if (rotatedLog.exists()) rotatedLog.delete();
                        currentLog.renameTo(rotatedLog);
                        currentLog = new File(logsDir, "app.log");
                    }

                    try (FileWriter fw = new FileWriter(currentLog, true)) {
                        fw.write(line + "\n");
                    }
                } catch (Exception e) {
                    Log.e("MaganisNative", "Failed to append log", e);
                }
            }
        });
        call.resolve();
    }

    @PluginMethod
    public void getLogs(PluginCall call) {
        int limit = call.getInt("limit", 200);
        writeExecutor.execute(() -> {
            synchronized (logLock) {
                try {
                    File logsDir = new File(getContext().getFilesDir(), "maganis/logs");
                    List<String> allLines = new ArrayList<>();

                    File rotatedLog = new File(logsDir, "app.1.log");
                    if (rotatedLog.exists()) {
                        readLinesFromFile(rotatedLog, allLines);
                    }

                    File currentLog = new File(logsDir, "app.log");
                    if (currentLog.exists()) {
                        readLinesFromFile(currentLog, allLines);
                    }

                    int total = allLines.size();
                    int start = Math.max(0, total - limit);
                    JSArray arr = new JSArray();
                    for (int i = start; i < total; i++) {
                        arr.put(allLines.get(i));
                    }

                    JSObject ret = new JSObject();
                    ret.put("lines", arr);
                    ret.put("totalLines", total);
                    call.resolve(ret);
                } catch (Exception e) {
                    call.reject("Failed to read logs: " + e.getMessage(), e);
                }
            }
        });
    }

    private void readLinesFromFile(File file, List<String> target) {
        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String l;
            while ((l = br.readLine()) != null) {
                target.add(l);
            }
        } catch (Exception ignored) {}
    }

    @PluginMethod
    public void clearLogs(PluginCall call) {
        writeExecutor.execute(() -> {
            synchronized (logLock) {
                try {
                    File logsDir = new File(getContext().getFilesDir(), "maganis/logs");
                    if (logsDir.exists() && logsDir.isDirectory()) {
                        File[] files = logsDir.listFiles();
                        if (files != null) {
                            for (File f : files) {
                                f.delete();
                            }
                        }
                    }
                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    call.resolve(ret);
                } catch (Exception e) {
                    call.reject("Failed to clear logs: " + e.getMessage(), e);
                }
            }
        });
    }

    @PluginMethod
    public void getNativeCrashLogs(PluginCall call) {
        writeExecutor.execute(() -> {
            try {
                File logsDir = new File(getContext().getFilesDir(), "maganis/logs");
                JSArray crashes = new JSArray();
                if (logsDir.exists() && logsDir.isDirectory()) {
                    File[] crashFiles = logsDir.listFiles((dir, name) -> name.startsWith("native-crash-") && name.endsWith(".txt"));
                    if (crashFiles != null) {
                        Arrays.sort(crashFiles, (f1, f2) -> Long.compare(f2.lastModified(), f1.lastModified()));
                        for (File f : crashFiles) {
                            JSObject crashObj = new JSObject();
                            crashObj.put("filename", f.getName());
                            crashObj.put("timestamp", f.lastModified());
                            StringBuilder sb = new StringBuilder();
                            try (BufferedReader br = new BufferedReader(new FileReader(f))) {
                                String line;
                                while ((line = br.readLine()) != null) {
                                    sb.append(line).append("\n");
                                }
                            }
                            crashObj.put("content", sb.toString());
                            crashes.put(crashObj);
                        }
                    }
                }
                JSObject ret = new JSObject();
                ret.put("crashes", crashes);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Failed to get native crash logs: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void getExitReasons(PluginCall call) {
        JSArray arr = new JSArray();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            try {
                ActivityManager am = (ActivityManager) getContext().getSystemService(Context.ACTIVITY_SERVICE);
                if (am != null) {
                    List<ApplicationExitInfo> exitInfos = am.getHistoricalProcessExitReasons(getContext().getPackageName(), 0, 5);
                    for (ApplicationExitInfo info : exitInfos) {
                        JSObject obj = new JSObject();
                        int reason = info.getReason();
                        obj.put("reasonCode", reason);
                        obj.put("timestamp", info.getTimestamp());
                        obj.put("importance", info.getImportance());
                        obj.put("pssKb", info.getPss());
                        obj.put("rssKb", info.getRss());
                        obj.put("description", info.getDescription() != null ? info.getDescription() : "");

                        String reasonAr = "إيقاف من نظام أندرويد (System Stop)";
                        switch (reason) {
                            case ApplicationExitInfo.REASON_CRASH:
                            case ApplicationExitInfo.REASON_CRASH_NATIVE:
                                reasonAr = "انهيار برمجي (Crash)";
                                break;
                            case ApplicationExitInfo.REASON_ANR:
                                reasonAr = "توقف عن الاستجابة (ANR)";
                                break;
                            case ApplicationExitInfo.REASON_LOW_MEMORY:
                                reasonAr = "ذاكرة الجهاز ممتلئة (Low Memory)";
                                break;
                            case ApplicationExitInfo.REASON_USER_REQUESTED:
                            case ApplicationExitInfo.REASON_USER_STOPPED:
                                reasonAr = "إغلاق بواسطة المستخدم (User Stop)";
                                break;
                            case ApplicationExitInfo.REASON_SIGNALED:
                                reasonAr = "إشارة إيقاف من النظام (Signaled)";
                                break;
                            case ApplicationExitInfo.REASON_DEPENDENCY_DIED:
                                reasonAr = "توقف خدمة تابعة (Dependency Died)";
                                break;
                            case ApplicationExitInfo.REASON_EXCESSIVE_RESOURCE_USAGE:
                                reasonAr = "استهلاك مفرط للموارد (Excessive Resources)";
                                break;
                        }
                        obj.put("reasonAr", reasonAr);
                        arr.put(obj);
                    }
                }
            } catch (Exception e) {
                Log.e("MaganisNative", "Failed to retrieve historical exit reasons", e);
            }
        }
        JSObject ret = new JSObject();
        ret.put("reasons", arr);
        ret.put("supported", Build.VERSION.SDK_INT >= Build.VERSION_CODES.R);
        call.resolve(ret);
    }

    @PluginMethod
    public void isSafeMode(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(MainActivity.PREFS_CRASH, Context.MODE_PRIVATE);
        boolean isSafe = prefs.getBoolean(MainActivity.KEY_SAFE_MODE, false);
        String raw = prefs.getString(MainActivity.KEY_LAUNCH_TIMESTAMPS, "");
        int launchCount = raw.isEmpty() ? 0 : raw.split(",").length;

        JSObject ret = new JSObject();
        ret.put("safeMode", isSafe);
        ret.put("launchCount", launchCount);
        call.resolve(ret);
    }

    @PluginMethod
    public void resetCrashLoop(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(MainActivity.PREFS_CRASH, Context.MODE_PRIVATE);
        prefs.edit()
            .remove(MainActivity.KEY_LAUNCH_TIMESTAMPS)
            .putBoolean(MainActivity.KEY_SAFE_MODE, false)
            .apply();

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void clearWebViewCache(PluginCall call) {
        Activity activity = getActivity();
        if (activity != null) {
            activity.runOnUiThread(() -> {
                try {
                    if (getBridge() != null && getBridge().getWebView() != null) {
                        getBridge().getWebView().clearCache(true);
                    }
                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    call.resolve(ret);
                } catch (Exception e) {
                    call.reject("Failed to clear webview cache: " + e.getMessage(), e);
                }
            });
        } else {
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void exportRawSnapshot(PluginCall call) {
        writeExecutor.execute(() -> {
            try {
                Context ctx = getContext();
                File snapshotsDir = new File(ctx.getFilesDir(), "maganis/snapshots");
                if (!snapshotsDir.exists()) snapshotsDir.mkdirs();

                long epoch = System.currentTimeMillis();
                File dumpFile = new File(snapshotsDir, "maganis-raw-export-" + epoch + ".json");

                // Read all keys directly from kvStore without app code
                List<String> keys = kvStore.listAllKeys();
                JSObject kvMap = new JSObject();
                for (String key : keys) {
                    String val = kvStore.read(key);
                    if (val != null) {
                        try {
                            kvMap.put(key, new JSObject(val));
                        } catch (Exception notObj) {
                            try {
                                kvMap.put(key, new JSArray(val));
                            } catch (Exception notArr) {
                                kvMap.put(key, val);
                            }
                        }
                    }
                }

                JSObject root = new JSObject();
                root.put("format", "maganis-snapshot-raw-dump");
                root.put("version", 2);
                root.put("exportedAt", epoch);
                root.put("source", "native-safe-mode-dump");
                root.put("kv", kvMap);

                try (FileWriter fw = new FileWriter(dumpFile)) {
                    fw.write(root.toString());
                }

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("filePath", dumpFile.getAbsolutePath());
                ret.put("fileName", dumpFile.getName());
                ret.put("fileSizeBytes", dumpFile.length());
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Failed to export raw snapshot: " + e.getMessage(), e);
            }
        });
    }
}
