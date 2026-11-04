# Capacitor Bridge & Plugins Preservation Rules
-keep public class * extends com.getcapacitor.Plugin
-keep public class com.getcapacitor.** { *; }
-keep class * implements com.getcapacitor.PluginMethod { *; }
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod public *;
    @com.getcapacitor.annotation.CapacitorPlugin public *;
    @com.getcapacitor.annotation.Permission public *;
}
-keepattributes *Annotation*
-keepattributes JavascriptInterface
