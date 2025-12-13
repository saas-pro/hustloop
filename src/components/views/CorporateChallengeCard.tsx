import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "../ui/progress";
import Image from "next/image";
import { useChallengeProgress } from "@/components/ui/useChallengeProgress";
import removeMarkdown from "remove-markdown";

export const CorporateChallengeCard = ({
    challenge,
    onViewDetails,
}: {
    challenge: any;
    onViewDetails: (
        type: "CorporateChallenges" | "MSMECollaboration" | "GovernmentChallenges",
        challenge: any
    ) => void;
}) => {
    const { progress, daysRemaining } = useChallengeProgress(challenge);
    const isClosed =
        challenge.status === "stopped" ||
        challenge.status === "expired";

    const cardClasses = isClosed
        && "bg-card/50 backdrop-blur-sm border-border/50";

    const progressColor = isClosed ? "bg-red-500" : "bg-primary";

    return (
        <Card className={`bg-card/50 backdrop-blur-sm border-border/50 flex flex-col`}>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Image
                        src={challenge.logo_url || "https://api.hustloop.com/static/images/building.png"}
                        alt={`${challenge.company_name} logo`}
                        width={60}
                        height={60}
                        className="rounded-lg"
                    />
                    <div>
                        <CardTitle className={`text-base line-clamp-2 ${isClosed ? "text-red-600" : ""}`}>
                            {challenge.title}
                        </CardTitle>

                        <CardDescription>
                            {challenge.company_name}
                        </CardDescription>

                        {<Badge variant={isClosed ? "destructive" : "secondary"} className="line-clamp-1 w-[50%]">
                            {challenge.company_sector}
                        </Badge>}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-grow">
                <div className="text-sm text-muted-foreground line-clamp-3">
                    {removeMarkdown(challenge.description)}
                </div>
            </CardContent>

            <CardFooter className="flex-col items-start space-y-2">

                {!isClosed && <Badge variant={"outline"}>
                    <>
                        Reward:{" "}
                        {challenge.reward_amount
                            ? `₹${challenge.reward_amount}`
                            : `₹${challenge.reward_min} - ₹${challenge.reward_max}`}
                    </>

                </Badge>}

                <Button
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50"

                    onClick={() => onViewDetails("CorporateChallenges", challenge)}
                >
                    {"View Challenge"}
                </Button>

                <div className="w-full mt-1">

                    <Progress
                        value={isClosed ? 100 : progress}
                        className="h-[6px]"
                        indicatorClassName={isClosed ? "bg-red-500" : "bg-primary"}
                    />

                    <div className="flex justify-between items-end text-xs text-muted-foreground mt-1">
                        <p>{challenge.submission_count} Sub...</p>
                        {isClosed ? (
                            <span className="text-red-600 font-semibold">Closed</span>
                        ) : (
                            <span>{daysRemaining}d remaining</span>
                        )}
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};
