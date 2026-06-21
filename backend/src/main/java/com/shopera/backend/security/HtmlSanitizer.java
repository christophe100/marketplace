package com.shopera.backend.security;

import java.util.regex.Pattern;

public class HtmlSanitizer {

    private static final Pattern[] SCRIPTS_PATTERNS = new Pattern[]{
        // Avoid script tags
        Pattern.compile("<script>(.*?)</script>", Pattern.CASE_INSENSITIVE),
        // Avoid src="..." with javascript
        Pattern.compile("src[\r\n]*=[\r\n]*\\'(.*?)\\'", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("src[\r\n]*=[\r\n]*\\\"(.*?)\\\"", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        // Avoid lonely script closing tags
        Pattern.compile("</script>", Pattern.CASE_INSENSITIVE),
        // Avoid any script opening style
        Pattern.compile("<script(.*?)>", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        // Avoid eval(...)
        Pattern.compile("eval\\((.*?)\\)", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        // Avoid expression(...)
        Pattern.compile("expression\\((.*?)\\)", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        // Avoid javascript:... urls
        Pattern.compile("javascript:", Pattern.CASE_INSENSITIVE),
        // Avoid vbscript:... urls
        Pattern.compile("vbscript:", Pattern.CASE_INSENSITIVE),
        // Avoid onload, onclick, onerror and other active event handlers
        Pattern.compile("onload(.*?)=", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("onclick(.*?)=", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("onerror(.*?)=", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("onmouseover(.*?)=", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("onfocus(.*?)=", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("onchange(.*?)=", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("onunload(.*?)=", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL)
    };

    /**
     * Sanitizes raw string input by systematically running pattern match replacements 
     * to eliminate common Cross-Site Scripting (XSS) vectors.
     */
    public static String sanitize(String input) {
        if (input == null) {
            return null;
        }
        
        String sanitized = input;
        
        // Remove null characters to stop evasive representation injection
        sanitized = sanitized.replace("\0", "");
        
        // Match regex rules and wash out script triggers safely
        for (Pattern pattern : SCRIPTS_PATTERNS) {
            sanitized = pattern.matcher(sanitized).replaceAll("");
        }
        
        // Convert strict HTML markers to escaped form if needed, or simply clean them
        sanitized = sanitized
                .replace("<", "&lt;")
                .replace(">", "&gt;");
                
        return sanitized.trim();
    }
}
