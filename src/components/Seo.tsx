import { Helmet } from "react-helmet-async";

type SeoProps = {
  title?: string;
  description?: string;
  noindex?: boolean;
  ogImage?: string;
};

export function Seo({ title, description, noindex, ogImage }: SeoProps) {
  return (
    <Helmet>
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      {title ? <meta property="og:title" content={title} /> : null}
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:type" content="website" />
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : null}
    </Helmet>
  );
}
