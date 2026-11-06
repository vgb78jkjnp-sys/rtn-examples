import { useState } from 'react';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import '../navbar-override.css';
import appLogo from '../assets/nokia.png';
import headerBg from '../assets/header-bg.png';
import AuthStatus from './AuthStatus';
import Footer from './Footer';

const drawerTextStyles = {
  '& .MuiTypography-root': {
    fontSize: '0.8rem'
  }
};

const navigationItems = [
  { label: 'Inventory', to: '/', enabled: true },
  { label: 'KKAQ', to: '/kkaq', enabled: true },
  { label: 'Spreadsheet', to: '/spreadsheet', enabled: true }
];

function InventoryLayout({ title, children, isExpanded = false, resultsLayout = false }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const centerClassName = [
    isExpanded ? 'center-expanded' : '',
    resultsLayout && !isExpanded ? 'center-results' : ''
  ].filter(Boolean).join(' ');

  return (
    <>
      <section style={{ backgroundColor: 'rgb(49, 126, 241)', height: '230px', width: '100%' }}>
        <nav
          className="navbar navbar-expand-lg fixed-top navbar-dark bg-primary"
          style={{
            zIndex: 1400,
            xbackgroundImage: `url(${headerBg})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        >
          <div className="container-fluid d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <button
                className="btn btn-link text-white xme-2"
                style={{ textDecoration: 'none' }}
                onClick={() => setDrawerOpen(true)}
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <Link className="navbar-brand d-flex align-items-center" to="/">
                <img src={appLogo} alt="Logo" width="120" height="50" className="d-inline-block align-top me-2" />
                <span style={{ fontSize: '.9rem', fontWeight: '500', paddingTop: '0.1rem', opacity: 0.9 }}>PA MES - Inventory</span>
              </Link>
            </div>
            <AuthStatus />
          </div>
        </nav>

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <List sx={{ top: 100, width: 250 }}>
            <ListItem button onClick={() => setDrawerOpen(false)} component="a" href="http://pa-mfgweb-prd1:8080/Mfg/SiteMap.aspx" target="_blank" rel="noopener">
              <ListItemText primary="MES Portal" sx={drawerTextStyles} />
            </ListItem>
            {navigationItems.map((item) => (
              item.enabled ? (
                <ListItem
                  key={item.label}
                  button
                  onClick={() => setDrawerOpen(false)}
                  component={Link}
                  to={item.to}
                  selected={location.pathname === item.to}
                >
                  <ListItemText primary={item.label} sx={drawerTextStyles} />
                </ListItem>
              ) : (
                <ListItem key={item.label} disabled>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      ...drawerTextStyles,
                      '& .MuiTypography-root': {
                        ...drawerTextStyles['& .MuiTypography-root'],
                        color: 'text.disabled'
                      }
                    }}
                  />
                </ListItem>
              )
            ))}
          </List>
        </Drawer>
      </section>

      {!isExpanded && (
        <section id="center2">
          <div className="container-fluid">
            <h4 style={{ color: 'white' }}>{title}</h4>
          </div>
        </section>
      )}

      <section id="center" className={centerClassName}>
        {children}
      </section>
      {!isExpanded && <Footer />}
    </>
  );
}

export default InventoryLayout;
