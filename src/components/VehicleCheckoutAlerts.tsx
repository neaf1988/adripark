import type { CheckoutAlert } from '@/utils/vehicleAlerts';

interface VehicleCheckoutAlertsProps {
  alerts: CheckoutAlert[];
}

const variantClasses: Record<CheckoutAlert['variant'], string> = {
  warning: 'border-warning bg-amber-50 text-amber-900',
  danger: 'border-danger bg-red-50 text-red-900',
  info: 'border-primary bg-blue-50 text-primary',
};

export function VehicleCheckoutAlerts({ alerts }: VehicleCheckoutAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-xl border-2 px-4 py-3 text-base font-bold ${variantClasses[alert.variant]}`}
        >
          {alert.label}
        </div>
      ))}
    </div>
  );
}
