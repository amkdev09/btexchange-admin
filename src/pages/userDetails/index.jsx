import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import tradeService from "../../services/tradeService";
import useSnackbar from "../../hooks/useSnackbar";
import BTLoader from "../../components/Loader";

const UserDetails = () => {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const { id, uid } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const params = id ? { id } : { uid };
        const response = await tradeService.getUserDetails(params);

        if (response.success) {
          setUserData(response.data);
        } else {
          showSnackbar("Failed to load user details", "error");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        showSnackbar(
          error.response?.data?.message || "Failed to load user details",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id || uid) {
      fetchUserDetails();
    }
  }, [id, uid, showSnackbar]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <BTLoader />
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box>
        <Typography variant="h6" sx={{ color: theme.palette.error.main }}>
          User not found
        </Typography>
      </Box>
    );
  }

  const { user, balances, incomes, stats } = userData;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/manage-users")}
          sx={{ color: theme.palette.text.secondary }}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            User Details
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Comprehensive user information and statistics
          </Typography>
        </Box>
      </Box>

      {/* User Info Card */}
      <Card>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            User Information
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block", mb: 0.5 }}>
                Name
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {user?.fullName || user?.name || "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block", mb: 0.5 }}>
                Email
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {user?.email || "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block", mb: 0.5 }}>
                UID
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: "monospace" }}>
                {user?.UID || user?.uid || "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block", mb: 0.5 }}>
                Status
              </Typography>
              <Chip
                label={user?.isBlocked ? "Blocked" : user?.isActive ? "Active" : "Inactive"}
                size="small"
                sx={{
                  bgcolor: user?.isBlocked
                    ? theme.palette.error.main + "1A"
                    : user?.isActive
                    ? theme.palette.success.main + "1A"
                    : theme.palette.text.disabled + "1A",
                  color: user?.isBlocked
                    ? theme.palette.error.main
                    : user?.isActive
                    ? theme.palette.success.main
                    : theme.palette.text.secondary,
                }}
              />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block", mb: 0.5 }}>
                Created At
              </Typography>
              <Typography variant="body2">
                {user?.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block", mb: 0.5 }}>
                Verified
              </Typography>
              <Chip
                label={user?.isEmailVerified ? "Verified" : "Not Verified"}
                size="small"
                sx={{
                  bgcolor: user?.isEmailVerified
                    ? theme.palette.success.main + "1A"
                    : theme.palette.warning.main + "1A",
                  color: user?.isEmailVerified
                    ? theme.palette.success.main
                    : theme.palette.warning.main,
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Balances" />
            <Tab label="Incomes" />
            <Tab label="Statistics" />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Wallet Balances
              </Typography>
              {balances ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block" }}>
                      Main Balance
                    </Typography>
                    <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
                      ${balances.mainBalance || "0.00"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block" }}>
                      Winnings Balance
                    </Typography>
                    <Typography variant="h6" sx={{ color: theme.palette.success.main }}>
                      ${balances.winningsBalance || "0.00"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block" }}>
                      Working Balance
                    </Typography>
                    <Typography variant="h6" sx={{ color: theme.palette.warning.main }}>
                      ${balances.workingBalance || "0.00"}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
                  No balance information available
                </Typography>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Income History
              </Typography>
              {incomes && incomes.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {incomes.map((income, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{income.type || "N/A"}</TableCell>
                          <TableCell align="right">${income.amount || "0.00"}</TableCell>
                          <TableCell>
                            {income.createdAt
                              ? new Date(income.createdAt).toLocaleString()
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
                  No income records available
                </Typography>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                User Statistics
              </Typography>
              {stats ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block" }}>
                      Total Trades
                    </Typography>
                    <Typography variant="h6">{stats.totalTrades || 0}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block" }}>
                      Total Volume
                    </Typography>
                    <Typography variant="h6">${stats.totalVolume || "0.00"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block" }}>
                      Referrals
                    </Typography>
                    <Typography variant="h6">{stats.totalReferrals || 0}</Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
                  No statistics available
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserDetails;
