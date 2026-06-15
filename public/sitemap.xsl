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
        <meta name="robots" content="noindex, follow"/>
        <title>Live sitemap · AniRise</title>
        <style>
          *{box-sizing:border-box}
          html,body{margin:0;background:#f8fafc;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Arial,sans-serif;line-height:1.5}
          header{background:linear-gradient(135deg,#0f172a,#1e293b);color:#f8fafc;padding:32px 24px;border-bottom:4px solid #6366f1}
          .wrap{max-width:1080px;margin:0 auto}
          h1{margin:0;font-size:22px;font-weight:750;letter-spacing:-.01em}
          .sub{margin-top:6px;color:#cbd5e1;font-size:12.5px}
          .sub a{color:#a5b4fc;text-decoration:none;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
          main{max-width:1080px;margin:0 auto;padding:20px 16px 48px}
          .bar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:12px;color:#64748b;margin-bottom:10px}
          .count{font-weight:600;color:#334155}
          .panel{background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,.05)}
          ul{list-style:none;margin:0;padding:0}
          .row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #eef2f7;flex-wrap:wrap}
          .row:last-child{border-bottom:0}
          .num{font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#94a3b8;width:24px;flex-shrink:0}
          .loc{flex:1;min-width:220px;font-size:12.5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#2563eb;text-decoration:none;overflow-wrap:anywhere}
          .meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
          .badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-size:10.5px;font-weight:600;line-height:1.4}
          .badge-pri{background:#f1f5f9;color:#334155}
          .badge-cf{background:#fff;color:#475569;border:1px solid #e2e8f0}
          .lm{font-size:10.5px;color:#94a3b8;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
          .empty{padding:24px;color:#64748b;font-size:13px}
          @media(max-width:560px){.num{width:20px}.row{padding:11px 12px}}
        </style>
      </head>
      <body>
        <header>
          <div class="wrap">
            <h1>Live sitemap</h1>
            <div class="sub">Auto-generated from your admin. Raw XML: <a href="https://anirise.com.bd/sitemap.xml">https://anirise.com.bd/sitemap.xml</a></div>
          </div>
        </header>
        <main>
          <xsl:choose>
            <xsl:when test="s:urlset/s:url">
              <div class="bar">
                <div>Live URLs from <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace">/sitemap.xml</span></div>
                <div class="count"><xsl:value-of select="count(s:urlset/s:url)"/> URLs</div>
              </div>
              <div class="panel">
                <ul>
                  <xsl:for-each select="s:urlset/s:url">
                    <li class="row">
                      <span class="num"><xsl:value-of select="position()"/></span>
                      <a class="loc" href="{s:loc}" target="_blank" rel="noreferrer"><xsl:value-of select="s:loc"/></a>
                      <div class="meta">
                        <xsl:if test="s:priority">
                          <span class="badge badge-pri">P <xsl:value-of select="s:priority"/></span>
                        </xsl:if>
                        <xsl:if test="s:changefreq">
                          <span class="badge badge-cf"><xsl:value-of select="s:changefreq"/></span>
                        </xsl:if>
                        <xsl:if test="s:lastmod">
                          <span class="lm"><xsl:value-of select="s:lastmod"/></span>
                        </xsl:if>
                      </div>
                    </li>
                  </xsl:for-each>
                </ul>
              </div>
            </xsl:when>
            <xsl:when test="s:sitemapindex/s:sitemap">
              <div class="bar">
                <div>Sitemap index</div>
                <div class="count"><xsl:value-of select="count(s:sitemapindex/s:sitemap)"/> sitemaps</div>
              </div>
              <div class="panel">
                <ul>
                  <xsl:for-each select="s:sitemapindex/s:sitemap">
                    <li class="row">
                      <span class="num"><xsl:value-of select="position()"/></span>
                      <a class="loc" href="{s:loc}" target="_blank" rel="noreferrer"><xsl:value-of select="s:loc"/></a>
                      <div class="meta">
                        <xsl:if test="s:lastmod">
                          <span class="lm"><xsl:value-of select="s:lastmod"/></span>
                        </xsl:if>
                      </div>
                    </li>
                  </xsl:for-each>
                </ul>
              </div>
            </xsl:when>
            <xsl:otherwise>
              <div class="panel"><div class="empty">No sitemap URLs found.</div></div>
            </xsl:otherwise>
          </xsl:choose>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
