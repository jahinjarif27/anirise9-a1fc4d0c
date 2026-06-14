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
        <title>AniRise XML Sitemap</title>
        <style>
          *{box-sizing:border-box}
          body{margin:0;background:#f8fafc;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Arial,sans-serif;line-height:1.5}
          header{background:#0f172a;color:#f8fafc;padding:28px 24px;border-bottom:4px solid #6366f1}
          .wrap{max-width:1120px;margin:0 auto}
          h1{margin:0;font-size:24px;font-weight:750}
          .summary{margin-top:6px;color:#cbd5e1;font-size:13px}
          main{max-width:1120px;margin:0 auto;padding:24px}
          .panel{background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,.06)}
          table{width:100%;border-collapse:collapse;font-size:14px}
          th,td{text-align:left;padding:13px 16px;border-bottom:1px solid #eef2f7;vertical-align:middle}
          th{background:#f8fafc;color:#334155;font-size:12px;text-transform:uppercase;letter-spacing:.04em;font-weight:700}
          tr:last-child td{border-bottom:0}
          a{color:#2563eb;text-decoration:none;overflow-wrap:anywhere}
          a:hover{text-decoration:underline}
          .muted{color:#64748b}
          .num{width:64px;color:#64748b}
          .empty{padding:24px;color:#64748b}
          @media(max-width:720px){
            main{padding:14px}
            th:nth-child(3),td:nth-child(3),th:nth-child(4),td:nth-child(4){display:none}
            .num{width:42px}
            th,td{padding:11px 10px}
          }
        </style>
      </head>
      <body>
        <header><div class="wrap"><h1>XML Sitemap</h1><div class="summary">Live indexable URLs for AniRise</div></div></header>
        <main>
          <div class="panel">
            <xsl:choose>
              <xsl:when test="s:urlset/s:url">
                <table>
                  <thead><tr><th class="num">#</th><th>URL</th><th>Last modified</th><th>Change frequency</th><th>Priority</th></tr></thead>
                  <tbody>
                    <xsl:for-each select="s:urlset/s:url">
                      <tr>
                        <td class="num"><xsl:value-of select="position()"/></td>
                        <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                        <td class="muted"><xsl:value-of select="s:lastmod"/></td>
                        <td class="muted"><xsl:value-of select="s:changefreq"/></td>
                        <td class="muted"><xsl:value-of select="s:priority"/></td>
                      </tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </xsl:when>
              <xsl:when test="s:sitemapindex/s:sitemap">
                <table>
                  <thead><tr><th class="num">#</th><th>Sitemap</th><th>Last modified</th></tr></thead>
                  <tbody>
                    <xsl:for-each select="s:sitemapindex/s:sitemap">
                      <tr>
                        <td class="num"><xsl:value-of select="position()"/></td>
                        <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                        <td class="muted"><xsl:value-of select="s:lastmod"/></td>
                      </tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </xsl:when>
              <xsl:otherwise><div class="empty">No sitemap URLs found.</div></xsl:otherwise>
            </xsl:choose>
          </div>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
