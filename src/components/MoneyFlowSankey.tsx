import {
  Layer,
  Rectangle,
  ResponsiveContainer,
  Sankey,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type SankeyNode, useSankeyData } from "@/hooks/use-sankey-data";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function getNodeColor(index: number): string {
  return COLORS[index % COLORS.length] ?? "var(--chart-1)";
}

type NodeProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: SankeyNode;
  containerWidth: number;
};

function SankeyNodeComponent({
  x,
  y,
  width,
  height,
  index,
  payload,
  containerWidth,
}: NodeProps) {
  const isLeftSide = x < containerWidth / 2;
  const labelX = isLeftSide ? x - 6 : x + width + 6;
  const textAnchor = isLeftSide ? "end" : "start";

  return (
    <Layer key={`node-${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={getNodeColor(index)}
        fillOpacity={0.9}
      />
      <text
        textAnchor={textAnchor}
        x={labelX}
        y={y + height / 2}
        fontSize={12}
        fill="var(--foreground)"
        dominantBaseline="middle"
      >
        {payload.displayName}
      </text>
    </Layer>
  );
}

type LinkPayload = {
  source: { displayName?: string };
  target: { displayName?: string };
  value: number;
};

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: LinkPayload }>;
}) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const data = payload[0].payload;
  const sourceName = data.source.displayName ?? "Unknown";
  const targetName = data.target.displayName ?? "Unknown";
  const value = data.value;

  const formattedValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md">
      <p className="font-medium">
        {sourceName} → {targetName}
      </p>
      <p className="text-muted-foreground">{formattedValue}/month</p>
    </div>
  );
}

export function MoneyFlowSankey() {
  const sankeyData = useSankeyData();

  if (!sankeyData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Money Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={sankeyData}
              nodeWidth={10}
              nodePadding={40}
              linkCurvature={0.5}
              node={(props: NodeProps) => (
                <SankeyNodeComponent {...props} containerWidth={700} />
              )}
              link={{ stroke: "var(--muted-foreground)" }}
              margin={{ top: 20, right: 120, bottom: 20, left: 120 }}
            >
              <Tooltip content={<TooltipContent />} />
            </Sankey>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
