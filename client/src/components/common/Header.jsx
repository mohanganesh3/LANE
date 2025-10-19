import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header style={{background: '#1f2937', color: 'white', padding: '16px'}}>
      <div style={{maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1 style={{fontSize: '24px', fontWeight: 'bold'}}>LANE</h1>
        <nav style={{display: 'flex', gap: '24px'}}>
          <Link to="/" style={{color: 'white', textDecoration: 'none'}}>Home</Link>
          <Link to="/search" style={{color: 'white', textDecoration: 'none'}}>Find Rides</Link>
          <Link to="/post-ride" style={{color: 'white', textDecoration: 'none'}}>Offer Ride</Link>
          <Link to="/login" style={{color: 'white', textDecoration: 'none'}}>Login</Link>
        </nav>
      </div>
    </header>
  );
}
