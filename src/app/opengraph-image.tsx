import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Cashflow Clarity | Premium Expense Tracker';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#030816', // Deep navy
          fontFamily: 'sans-serif',
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(200, 150, 20, 0.4), transparent 40%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Mock Logo Graphic */}
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#deb02b', // Premium Gold
              borderRadius: '20px',
              display: 'flex',
              marginBottom: '40px',
            }}
          />
        </div>
        <div
          style={{
            fontSize: '80px',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-2px',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          Stop overspending.
        </div>
        <div
          style={{
            fontSize: '80px',
            fontWeight: 800,
            color: '#deb02b',
            letterSpacing: '-2px',
            textAlign: 'center',
            lineHeight: 1.1,
            marginTop: '10px',
          }}
        >
          Start building wealth.
        </div>
        <div
          style={{
            marginTop: '40px',
            fontSize: '32px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          The #1 Premium Expense Tracker for Fast-Moving Founders.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
