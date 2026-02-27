const configs = {
  BACKLOG_BASE_URL: `${process.env.NEXT_PUBLIC_BACKLOG_BASE_URL}`,
  BACKLOG_API_KEY: `${process.env.NEXT_PUBLIC_BACKLOG_API_KEY}`,
  BACKLOG_PROJECT_ID_OR_KEY: `${process.env.NEXT_PUBLIC_BACKLOG_PROJECT_KEY}`,
  BACKLOG_PROJECT_ID: `${process.env.NEXT_PUBLIC_BACKLOG_PROJECT_ID}`,
  API_DOMAIN: `${process.env.NEXT_PUBLIC_API_DOMAIN}`,
  ACMS_API_URL: `${process.env.NEXT_PUBLIC_ACMS_DOMAIN}`,
  PROJECT_PRESENTATION_API_URL: `${
    process.env.NEXT_PUBLIC_PROJECT_PRESENTATION_API_URL ??
    "https://project-presentation-api.amela.vn"
  }`.replace(/\/+$/, ""),
};

export default configs;
