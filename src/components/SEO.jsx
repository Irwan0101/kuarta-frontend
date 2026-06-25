import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://kuartabimbel.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_TITLE = 'Kuarta Bimbel — Platform Belajar Online Terbaik untuk CPNS, UTBK, OSN & Bimbel SD/SMP/SMA';
const DEFAULT_DESC = 'Kuarta Bimbel: platform belajar online lengkap dengan video HD, tryout akurat, live class, dan leaderboard nasional. 120.000+ siswa telah bergabung. Gratis!';

export default function SEO({ title, description, image, url, type = 'website', publishedTime, noindex }) {
  const pageTitle = title ? `${title} — Kuarta Bimbel` : DEFAULT_TITLE;
  const pageDesc = description || DEFAULT_DESC;
  const pageImage = image || DEFAULT_IMAGE;
  const pageUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <link rel="canonical" href={pageUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content="Kuarta Bimbel" />
      <meta property="og:locale" content="id_ID" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={pageImage} />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'EducationalOccupationalCredential',
          name: 'Kuarta Bimbel',
          description: DEFAULT_DESC,
          url: SITE_URL,
          provider: {
            '@type': 'Organization',
            name: 'Kuarta',
            url: SITE_URL,
          },
          audience: {
            '@type': 'EducationalAudience',
            educationalRole: 'student',
          },
        })}
      </script>
    </Helmet>
  );
}
