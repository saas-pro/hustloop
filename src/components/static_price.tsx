const plans = [
    {
        name: "Free",
        price: "₹0",
        description: "Kickstart with technology discovery and foundational support at no cost.",
        features: [
            "Technology / IP (Intellectual Property)",
            "Basic support"
        ],
        cta: "Get Started",
        primary: false,
        note: "Payment integration coming soon."
    },
    {
        name: "Standard",
        price: "₹999",
        originally: "₹1499",
        offer: "33% OFF",
        description: "Accelerate incubation with full access and priority support.",
        features: [
            "Access to all incubators",
            "Submit 1 Idea to Incubator",
            "45 Days Duration",
            "Priority Support"
        ],
        cta: "Get Started",
        primary: false,
        note: "Payment integration coming soon."
    },
    {
        name: "Premium",
        tag: "Popular",
        price: "₹2999",
        originally: "₹3999",
        offer: "25% OFF",
        description: "Solve MSME challenges with submissions and 24/7 priority support.",
        features: [
            "Browse Challenges",
            "Submit 1 solution to MSME",
            "60 days duration",
            "24/7 priority support"
        ],
        cta: "Get Started",
        primary: true,
        note: "Payment integration coming soon."
    },
    {
        name: "Enterprise",
        description: "High-touch support with fully customizable problem‑solving solutions and dedicated expert assistance.",
        features: [
            "Tailored Solutions",
            "You can discuss your requirements with us",
            "24/7 priority support"
        ],
        cta: "Contact Us",
        primary: false,
        note: "Payment integration coming soon."
    }
];

export default plans