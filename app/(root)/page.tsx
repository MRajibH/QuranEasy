/* eslint-disable @next/next/no-html-link-for-pages -- links cross root layouts and need a full page load */
import { LOCALE_KEY } from "@/lib/theme";

// "/" sends visitors to their saved language (Bangla by default). Works without JS via meta refresh.
const redirect = `(function(){var l="bn";try{var s=localStorage.getItem("${LOCALE_KEY}");if(s==="en"||s==="bn")l=s;else if(!/^bn/i.test(navigator.language)&&/^en/i.test(navigator.language))l="en";}catch(e){}location.replace("/"+l+"/");})();`;

export default function RootPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: redirect }} />
      <noscript>
        <meta httpEquiv="refresh" content="0; url=/bn/" />
      </noscript>
      <p style={{ fontFamily: "system-ui", padding: 24 }}>
        <a href="/bn/">বাংলা</a> · <a href="/en/">English</a>
      </p>
    </>
  );
}
