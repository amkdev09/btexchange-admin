import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Box, Drawer, IconButton, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Close from "@mui/icons-material/Close";
import { AppColors } from "../../constant/appColors";
import { protectedRouters } from "../../router/router.config";
import { protectedRouters2 } from "../../router/router.config";
import useAuth from "../../hooks/useAuth";

const Sidebar = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const location = useLocation();

  const { isSecondGame } = useAuth();

  const asideItems = isSecondGame ? protectedRouters2 : protectedRouters;

  const drawerContent = (
    <Box sx={{ width: 256, height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: { xs: "flex", lg: "none" },
          height: 64,
          px: 2,
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.text.disabled}`,
        }}
      >
        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 700,
            background: `radial-gradient(ellipse farthest-corner at right bottom, #FEDB37 0%, #FDB931 8%, #9f7928 20%, #8A6E2F 30%, transparent 80%),
              radial-gradient(ellipse farthest-corner at left top, #FFFFFF 0%, #FFFFAC 8%, #D1B464 25%,  #FDB931 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          BT EXCHANGE
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            "&:hover": {
              color: theme.palette.text.primary,
              bgcolor: theme.palette.secondary.light,
            },
          }}
        >
          <Close />
        </IconButton>
      </Box>

      <List sx={{ mt: 2, px: 1.5, flex: 1, overflowY: "auto" }}>
        {asideItems?.filter((item) => item?.inSidebarMenu)?.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={onClose}
                className={isActive ? "btn-primary" : ""}
                sx={{
                  borderRadius: 1,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.secondary,
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          display: { lg: "none" },
          position: "fixed",
          inset: 0,
          zIndex: 30,
          bgcolor: theme.palette.background.default + "66",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s",
        }}
        onClick={onClose}
      />
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { lg: "none" },
          "& .MuiDrawer-paper": {
            width: 257,
            bgcolor: AppColors.BG_CARD,
            borderRight: `1px solid ${theme.palette.text.disabled}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box
        component="aside"
        sx={{
          display: { xs: "none", lg: "block" },
          width: 256,
          bgcolor: AppColors.BG_CARD,
        }}
      >
        {drawerContent}
      </Box>
    </>
  );
};

export default Sidebar;