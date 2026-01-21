import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const ACHIEVEMENTS = [
  "Completed Phase 1 of User Authentication module ahead of schedule.",
  "Successfully optimized database queries, reducing load time by 30%.",
  "Resolved critical bug in payment gateway integration.",
  "Team velocity increased by 15% this sprint.",
];

export function KeyAchievements() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Key Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Nhập những thành tựu đáng chú ý của tuần này..."
          className="min-h-[200px] resize-none"
        />
      </CardContent>
    </Card>
  );
}
