<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="s">
  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>XML Sitemap</title>
        <style>
          :root { color-scheme: dark; }
          html, body {
            margin: 0;
            padding: 0;
            background: #1b1b1b;
            color: #d4d4d4;
            font-family: ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
            font-size: 13px;
            line-height: 1.5;
          }
          .notice {
            background: #1b1b1b;
            color: #d4d4d4;
            padding: 10px 16px;
            border-bottom: 1px solid #2a2a2a;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 13px;
          }
          .notice a { color: #4eaaff; text-decoration: none; }
          .notice a:hover { text-decoration: underline; }
          .tree {
            padding: 12px 18px 40px;
            white-space: pre;
            overflow-x: auto;
          }
          .node { display: block; }
          .children { padding-left: 20px; display: block; }
          .caret {
            color: #d4d4d4;
            display: inline-block;
            width: 12px;
            user-select: none;
          }
          .tag      { color: #5db0d7; }
          .tag-name { color: #5db0d7; }
          .attr     { color: #9cdcfe; }
          .eq       { color: #d4d4d4; }
          .str      { color: #ce9178; }
          .text     { color: #d4d4d4; }
          a { color: #ce9178; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .punct { color: #808080; }
        </style>
      </head>
      <body>
        <div class="notice">
          This XML file does not appear to have any style information associated with it. The document tree is shown below.
        </div>
        <div class="tree"><xsl:apply-templates select="*" mode="root"/></div>
      </body>
    </html>
  </xsl:template>

  <!-- sitemapindex root -->
  <xsl:template match="s:sitemapindex" mode="root">
    <span class="node"><span class="caret">▼</span><span class="punct">&lt;</span><span class="tag-name">sitemapindex</span> <span class="attr">xmlns</span><span class="eq">=</span><span class="str">"http://www.sitemaps.org/schemas/sitemap/0.9"</span><span class="punct">&gt;</span></span>
    <span class="children"><xsl:apply-templates select="s:sitemap"/></span>
    <span class="node"><span class="punct">&lt;/</span><span class="tag-name">sitemapindex</span><span class="punct">&gt;</span></span>
  </xsl:template>

  <!-- urlset root -->
  <xsl:template match="s:urlset" mode="root">
    <span class="node"><span class="caret">▼</span><span class="punct">&lt;</span><span class="tag-name">urlset</span> <span class="attr">xmlns</span><span class="eq">=</span><span class="str">"http://www.sitemaps.org/schemas/sitemap/0.9"</span><span class="punct">&gt;</span></span>
    <span class="children"><xsl:apply-templates select="s:url"/></span>
    <span class="node"><span class="punct">&lt;/</span><span class="tag-name">urlset</span><span class="punct">&gt;</span></span>
  </xsl:template>

  <xsl:template match="s:sitemap">
    <span class="node"><span class="caret">▼</span><span class="punct">&lt;</span><span class="tag-name">sitemap</span><span class="punct">&gt;</span></span>
    <span class="children">
      <span class="node"><span class="punct">&lt;</span><span class="tag-name">loc</span><span class="punct">&gt;</span><a href="{s:loc}"><xsl:value-of select="s:loc"/></a><span class="punct">&lt;/</span><span class="tag-name">loc</span><span class="punct">&gt;</span></span>
      <xsl:if test="s:lastmod">
        <span class="node"><span class="punct">&lt;</span><span class="tag-name">lastmod</span><span class="punct">&gt;</span><span class="text"><xsl:value-of select="s:lastmod"/></span><span class="punct">&lt;/</span><span class="tag-name">lastmod</span><span class="punct">&gt;</span></span>
      </xsl:if>
    </span>
    <span class="node"><span class="punct">&lt;/</span><span class="tag-name">sitemap</span><span class="punct">&gt;</span></span>
  </xsl:template>

  <xsl:template match="s:url">
    <span class="node"><span class="caret">▼</span><span class="punct">&lt;</span><span class="tag-name">url</span><span class="punct">&gt;</span></span>
    <span class="children">
      <span class="node"><span class="punct">&lt;</span><span class="tag-name">loc</span><span class="punct">&gt;</span><a href="{s:loc}"><xsl:value-of select="s:loc"/></a><span class="punct">&lt;/</span><span class="tag-name">loc</span><span class="punct">&gt;</span></span>
      <xsl:if test="s:lastmod">
        <span class="node"><span class="punct">&lt;</span><span class="tag-name">lastmod</span><span class="punct">&gt;</span><span class="text"><xsl:value-of select="s:lastmod"/></span><span class="punct">&lt;/</span><span class="tag-name">lastmod</span><span class="punct">&gt;</span></span>
      </xsl:if>
      <xsl:if test="s:changefreq">
        <span class="node"><span class="punct">&lt;</span><span class="tag-name">changefreq</span><span class="punct">&gt;</span><span class="text"><xsl:value-of select="s:changefreq"/></span><span class="punct">&lt;/</span><span class="tag-name">changefreq</span><span class="punct">&gt;</span></span>
      </xsl:if>
      <xsl:if test="s:priority">
        <span class="node"><span class="punct">&lt;</span><span class="tag-name">priority</span><span class="punct">&gt;</span><span class="text"><xsl:value-of select="s:priority"/></span><span class="punct">&lt;/</span><span class="tag-name">priority</span><span class="punct">&gt;</span></span>
      </xsl:if>
    </span>
    <span class="node"><span class="punct">&lt;/</span><span class="tag-name">url</span><span class="punct">&gt;</span></span>
  </xsl:template>
</xsl:stylesheet>
