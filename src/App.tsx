import { useState } from 'react';
import { CheckInForm } from '@/components/CheckInForm';
import { CheckOutForm } from '@/components/CheckOutForm';
import { HistoryScreen } from '@/components/HistoryScreen';
import { HomeScreen } from '@/components/HomeScreen';
import { ParkedList } from '@/components/ParkedList';
import { RatesForm } from '@/components/RatesForm';

type View = 'home' | 'checkin' | 'checkout' | 'rates' | 'parked' | 'history';

function App() {
  const [view, setView] = useState<View>('home');
  const [homeKey, setHomeKey] = useState(0);

  function goHome() {
    setView('home');
    setHomeKey((k) => k + 1);
  }

  switch (view) {
    case 'checkin':
      return <CheckInForm onBack={goHome} onSuccess={goHome} />;
    case 'checkout':
      return <CheckOutForm onBack={goHome} onSuccess={goHome} />;
    case 'rates':
      return <RatesForm onBack={goHome} />;
    case 'parked':
      return <ParkedList onBack={goHome} />;
    case 'history':
      return <HistoryScreen onBack={goHome} />;
    default:
      return (
        <HomeScreen
          key={homeKey}
          onCheckIn={() => setView('checkin')}
          onCheckOut={() => setView('checkout')}
          onParked={() => setView('parked')}
          onRates={() => setView('rates')}
          onHistory={() => setView('history')}
        />
      );
  }
}

export default App;
