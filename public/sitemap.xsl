<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="s">
  <xsl:output method="html" encoding="UTF-8" indent="no" doctype-system="about:legacy-compat"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex"/>
        <title>sitemap.xml</title>
        <style>
          html,body{margin:0;background:#fff;color:#000;font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
          .note{padding:8px 12px;border-bottom:1px solid #ddd;color:#333;font:12px/1.4 -apple-system,Segoe UI,Arial,sans-serif}
          pre{margin:0;padding:12px;white-space:pre;overflow-x:auto}
          .tag{color:#881280}
          .attr{color:#994500}
          .val{color:#1a1aa6}
          .txt{color:#000}
          .pi{color:#881280}
        </style>
      </head>
      <body>
        <div class="note">This XML file does not appear to have any style information associated with it. The document tree is shown below.</div>
        <pre><span class="pi">&lt;?xml version="1.0" encoding="UTF-8"?&gt;</span>
<xsl:choose>
  <xsl:when test="s:urlset"><span class="tag">&lt;urlset</span> <span class="attr">xmlns</span>=<span class="val">"http://www.sitemaps.org/schemas/sitemap/0.9"</span><span class="tag">&gt;</span>
<xsl:for-each select="s:urlset/s:url">  <span class="tag">&lt;url&gt;</span>
    <span class="tag">&lt;loc&gt;</span><span class="txt"><xsl:value-of select="s:loc"/></span><span class="tag">&lt;/loc&gt;</span>
<xsl:if test="s:lastmod">    <span class="tag">&lt;lastmod&gt;</span><span class="txt"><xsl:value-of select="s:lastmod"/></span><span class="tag">&lt;/lastmod&gt;</span>
</xsl:if><xsl:if test="s:changefreq">    <span class="tag">&lt;changefreq&gt;</span><span class="txt"><xsl:value-of select="s:changefreq"/></span><span class="tag">&lt;/changefreq&gt;</span>
</xsl:if><xsl:if test="s:priority">    <span class="tag">&lt;priority&gt;</span><span class="txt"><xsl:value-of select="s:priority"/></span><span class="tag">&lt;/priority&gt;</span>
</xsl:if>  <span class="tag">&lt;/url&gt;</span>
</xsl:for-each><span class="tag">&lt;/urlset&gt;</span></xsl:when>
  <xsl:when test="s:sitemapindex"><span class="tag">&lt;sitemapindex</span> <span class="attr">xmlns</span>=<span class="val">"http://www.sitemaps.org/schemas/sitemap/0.9"</span><span class="tag">&gt;</span>
<xsl:for-each select="s:sitemapindex/s:sitemap">  <span class="tag">&lt;sitemap&gt;</span>
    <span class="tag">&lt;loc&gt;</span><span class="txt"><xsl:value-of select="s:loc"/></span><span class="tag">&lt;/loc&gt;</span>
<xsl:if test="s:lastmod">    <span class="tag">&lt;lastmod&gt;</span><span class="txt"><xsl:value-of select="s:lastmod"/></span><span class="tag">&lt;/lastmod&gt;</span>
</xsl:if>  <span class="tag">&lt;/sitemap&gt;</span>
</xsl:for-each><span class="tag">&lt;/sitemapindex&gt;</span></xsl:when>
</xsl:choose></pre>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
