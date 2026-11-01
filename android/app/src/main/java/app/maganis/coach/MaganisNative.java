package app.maganis.coach;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.content.pm.SigningInfo;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.security.MessageDigest;

@CapacitorPlugin(name = "MaganisNative")
public class MaganisNative extends Plugin {

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
}

