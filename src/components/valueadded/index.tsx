import { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sprout, Users, Network } from "lucide-react";

export type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

type Step = {
    icon: LucideIcon;
    title: string;
    description: string;
};

type ValueAddedProps = {
    valueAddedFeatures: Step[];
};

const ValueAdded = ({ valueAddedFeatures }: ValueAddedProps) => {

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
            },
        },
    };

    const itemVariantsRight = {
        hidden: { opacity: 0, x: -100 },
        show: { opacity: 1, x: 0, transition: { duration: 0.8 } },
    };

    const itemVariantsLeft = {
        hidden: { opacity: 0, x: 100 },
        show: { opacity: 1, x: 0, transition: { duration: 0.8 } },
    };

    const circleVariants = {
        hidden: { scale: 0 },
        show: { scale: 1, transition: { duration: 0.5 } },
    };

    return (
        <section className="relative py-24 md:py-32 bg-background">
            <div className="mx-auto px-4 max-w-7xl">
                <div className="text-center mb-16">
                    <h4 className="text-4xl font-extrabold text-current mb-4">Value-Added Features</h4>
                    <p className="text-xl text-foreground">Empowering your journey with key support systems.</p>
                </div>
                
                <div className="relative overflow-hidden">
                    {/* The vertical timeline line, now responsive */}
                    <motion.div
                        className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border -z-10"
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        viewport={{ once: true, amount: 0.5 }}
                    />
                    
                    <motion.div
                        className="flex flex-col items-start md:items-center"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.5 }}
                    >
                        {valueAddedFeatures.map((step, stepIndex) => {
                            const isOdd = stepIndex % 2 !== 0;

                            return (
                                <motion.div
                                    key={stepIndex}
                                    className={cn(
                                        "relative flex items-center w-full my-8",
                                        "justify-start", // Default mobile justification
                                        isOdd ? "md:justify-end" : "md:justify-start" // Desktop alternating justification
                                    )}
                                >
                                    {/* Content Box */}
                                    <motion.div
                                        className={cn(
                                            "w-full ml-12 md:w-5/12 p-8 rounded-lg shadow-xl",
                                            isOdd ? "md:ml-0 md:mr-auto" : "md:ml-auto md:mr-0",
                                            "bg-background border border-muted-foreground" 
                                        )}
                                        variants={isOdd ? itemVariantsLeft : itemVariantsRight}
                                    >
                                        <h5 className="font-semibold text-xl md:text-2xl text-current mb-2">{step.title}</h5>
                                        <p className="text-sm md:text-base text-muted-foreground">{step.description}</p>
                                    </motion.div>
                                    
                                    {/* Timeline Circle, now responsive */}
                                    <motion.div 
                                        className="size-16 rounded-full bg-background border-4 border-primary absolute left-0 md:left-1/2 -translate-x-1/2 flex items-center justify-center z-10"
                                        variants={circleVariants}
                                    >
                                        <step.icon className="size-8 text-primary" />
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ValueAdded;