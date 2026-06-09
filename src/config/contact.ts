const contactConfig = {
  /**
   * FORM_ID from webmaster.devlune.in — paste the UUID here after creating the form.
   * Fields defined in the dashboard must match the keys used in ContactSection.tsx:
   *   name, email, subject, topic, message
   * (Devlune slugifies labels to lowercase by default.)
   */
  formId: "f1ad2b3e-6bbe-4696-8a12-bedb8c41c504",
  endpointBase: "https://cdn.devlune.in",

  heading: "Get in Touch",
  subtitle: "Have a project in mind, a question, or just want to say hi?",

  // Shown beside the form; also used for the copy-email button
  publicEmail: "rsgame0604@gmail.com",

  /**
   * Must match the select options you configured in the Devlune dashboard
   * (Topic | select field).
   */
  topics: ["Work", "Collaboration", "Just saying hi", "Other"],

  toast: {
    success: "Message sent! I'll get back to you soon.",
    error: "Something went wrong. Try emailing me directly.",
  },
};

export default contactConfig;
