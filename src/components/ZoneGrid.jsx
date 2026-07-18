import ZoneCard from "./ZoneCard";

export default function ZoneGrid({ zones }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 content-start">
      {zones.map((zone) => (
        <ZoneCard key={zone.id} zone={zone} />
      ))}
    </div>
  );
}
