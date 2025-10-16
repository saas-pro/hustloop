const plans = [
    {
        name: "Free",
        price: "₹0",
        description: "For individuals getting started.",
        features: [
            "Technology/ IP (Intellectual Property)",
            "Basic support"
        ],
        cta: "Get Started",
        primary: false,
        note: "Payment integration coming soon. You will be notified before your plan ends."
    },
    {
        name: "Standard",
        price: "₹999",
        description: "For growing teams that need more access and support.",
        features: [
            "Access to all incubators",
            "Submit 1 Idea to Incubator",
            "45 Days Duration",
            "Priority Support"
        ],
        cta: "Get Started",
        primary: false,
        note: "Payment integration coming soon. You will be notified before your plan ends."
    },
    {
        name: "Premium",
        tag: "Popular",
        price: "₹2999",
        description: "For established businesses and enterprises.",
        features: [
            "Browse Challenges",
            "Submit 1 solution to MSME",
            "60 days duration",
            "24/7 priority support"
        ],
        cta: "Get Started",
        primary: true,
        note: "Payment integration coming soon. You will be notified before your plan ends."
    },
];

export default plans