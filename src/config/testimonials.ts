export interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  // 1–2 letter initials displayed inside the avatar circle
  initials: string;
}

export interface TestimonialsConfig {
  heading: string;
  subheading: string;
  items: TestimonialItem[];
}

// Example testimonial entry:
// {
//   quote: "Exceptional work ethic and communication throughout the project. Would hire again.",
//   name: "Jane Doe",
//   role: "Product Manager at Acme",
//   initials: "JD",
// }

const testimonials: TestimonialsConfig = {
  heading: "Kind Words",
  subheading: "What people say about working with me",
  items: [
    {
      quote: "Very sleek, clean, minimalist style of web design while maintaining its visually pleasing aesthetic and organized. But my most favourite part is how you took the time to add my OWN personal touch to it, aswell as your own.",
      name: "Luce",
      role: "Influencer",
      initials: "Lu",
    },
    // {
    //   quote: "One of the most thoughtful developers I've worked with. He asks the right questions before writing a single line of code, which saves so much back-and-forth.",
    //   name: "Priya Nair",
    //   role: "Engineering Manager",
    //   initials: "PN",
    // },
    // {
    //   quote: "Delivered a full-stack feature end-to-end with solid tests and docs. Rare to find someone who cares as much about the backend as the frontend.",
    //   name: "Daniel Park",
    //   role: "Senior Engineer",
    //   initials: "DP",
    // },
  ],
};

export default testimonials;
