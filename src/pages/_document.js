import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    const gtmId = 'GTM-T4JZP38B'; // Updated GTM container ID

    return (
      <Html lang="en">
        <Head>
          {/* Google Tag Manager (GTM) - Head */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />

          {/* Link to the manifest.json file */}
          <link rel="manifest" href="/manifest.json" />
          
          {/* Meta Tags for SEO and Mobile Optimization */}
          <meta name="description" content="A terminal emulator in the browser powered by Next.js." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="author" content="lelbois" />
          <meta property="og:title" content="Terminal Emulator in Browser" />
          <meta property="og:description" content="A terminal emulator in the browser powered by Next.js." />
          <meta property="og:image" content="/meta-tag-img.png" />
          <meta property="og:url" content="https://nextvm.vercel.app" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="NextVM - Terminal Emulator in Browser" />
          <meta name="twitter:description" content="A terminal emulator in the browser powered by Next.js." />
          <meta name="twitter:image" content="/meta-tag-img.png" />
        </Head>

        <body>
          {/* Google Tag Manager (noscript) - Body */}
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            ></iframe>
          </noscript>

          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
