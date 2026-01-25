import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import adminService from "../../services/adminService";
import useSnackbar from "../../hooks/useSnackbar";

const CHAINS = ["BSC", "ETH", "POLYGON"];

const FundManagement = () => {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [chain, setChain] = useState("BSC");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [chainBalances, setChainBalances] = useState({});
  const [sweepDialog, setSweepDialog] = useState(false);
  const [sweepType, setSweepType] = useState("single"); // 'single' or 'all'
  const [toAddress, setToAddress] = useState("");
  const [sweepLoading, setSweepLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  const handleCheckBalance = async () => {
    if (!address) {
      showSnackbar("Please enter an address", "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await adminService.getAddressBalance({
        address,
        chain,
      });

      if (response.success) {
        setBalance(response.data);
        showSnackbar("Balance retrieved successfully", "success");
      }
    } catch (error) {
      console.error("Error checking balance:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to check balance",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGetChainBalances = async () => {
    setLoading(true);
    try {
      const response = await adminService.getChainBalances({ chain });

      if (response.success) {
        setChainBalances(response.data);
        showSnackbar("Chain balances retrieved successfully", "success");
      }
    } catch (error) {
      console.error("Error getting chain balances:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to get chain balances",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckSweep = async () => {
    if (!address) {
      showSnackbar("Please enter an address", "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await adminService.checkSweep({
        address,
        chain,
      });

      if (response.success) {
        setCheckResult(response.data);
        showSnackbar("Sweep check completed", "success");
      }
    } catch (error) {
      console.error("Error checking sweep:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to check sweep",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSweep = async () => {
    if (!toAddress) {
      showSnackbar("Please enter destination address", "warning");
      return;
    }

    if (sweepType === "single" && !address) {
      showSnackbar("Please enter source address", "warning");
      return;
    }

    setSweepLoading(true);
    try {
      let response;
      if (sweepType === "single") {
        response = await adminService.sweepAddress({
          address,
          chain,
          toAddress,
        });
      } else {
        response = await adminService.sweepAll({
          chain,
          toAddress,
        });
      }

      if (response.success) {
        showSnackbar(
          sweepType === "single"
            ? "Funds swept successfully"
            : "Sweep process initiated",
          "success"
        );
        setSweepDialog(false);
        setAddress("");
        setToAddress("");
        setBalance(null);
        setCheckResult(null);
      }
    } catch (error) {
      console.error("Error sweeping funds:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to sweep funds",
        "error"
      );
    } finally {
      setSweepLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 0.5 }}>
          Fund Management (Treasury)
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Manage and sweep funds from deposit addresses
        </Typography>
      </Box>

      {/* Chain Selection */}
      <Card>
        <CardContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Chain</InputLabel>
            <Select
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              label="Chain"
            >
              {CHAINS.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Check Address Balance */}
      <Card>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Check Address Balance
          </Typography>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Wallet Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
            />
            <Button
              variant="contained"
              onClick={handleCheckBalance}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AccountBalanceWalletIcon />}
            >
              Check Balance
            </Button>
          </Box>

          {balance !== null && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Balance: <strong>{balance} USDT</strong>
              </Typography>
            </Alert>
          )}

          {checkResult && (
            <Box sx={{ mt: 2, p: 2, bgcolor: theme.palette.background.default, borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Sweep Check Result
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography variant="body2">
                  Can Sweep: <strong>{checkResult.canSweep ? "Yes" : "No"}</strong>
                </Typography>
                <Typography variant="body2">
                  USDT Balance: <strong>{checkResult.usdtBalance} USDT</strong>
                  </strong>
                </Typography>
                <Typography variant="body2">
                  Native Balance: <strong>{checkResult.nativeBalance}</strong>
                </Typography>
                <Typography variant="body2">
                  Gas Required: <strong>{checkResult.gasRequired}</strong>
                </Typography>
                {checkResult.message && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {checkResult.message}
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCheckSweep}
              disabled={loading || !address}
            >
              Check Sweep Status
            </Button>
            <Button
              variant="outlined"
              onClick={handleGetChainBalances}
              disabled={loading}
            >
              Get All Chain Balances
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Chain Balances Table */}
      {Object.keys(chainBalances).length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              All Addresses on {chain}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Address</TableCell>
                    <TableCell align="right">Balance (USDT)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(chainBalances).map(([addr, bal]) => (
                    <TableRow key={addr}>
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "monospace",
                            wordBreak: "break-all",
                          }}
                        >
                          {addr}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{bal}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Sweep Actions */}
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setSweepType("single");
                setSweepDialog(true);
              }}
              disabled={!address}
              startIcon={<SwapHorizIcon />}
            >
              Sweep Single Address
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setSweepType("all");
                setSweepDialog(true);
              }}
              startIcon={<SwapHorizIcon />}
            >
              Sweep All Addresses
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Sweep Dialog */}
      <Dialog
        open={sweepDialog}
        onClose={() => setSweepDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {sweepType === "single" ? "Sweep Single Address" : "Sweep All Addresses"}
          </Typography>
          <IconButton onClick={() => setSweepDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {sweepType === "single" && (
              <TextField
                fullWidth
                label="Source Address"
                value={address}
                disabled
                helperText="Address to sweep from"
              />
            )}
            <TextField
              fullWidth
              label="Destination Address"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="0x..."
              required
              helperText="Treasury address to receive funds"
            />
            <FormControl fullWidth>
              <InputLabel>Chain</InputLabel>
              <Select value={chain} label="Chain" disabled>
                {CHAINS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSweepDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSweep}
            disabled={sweepLoading || !toAddress}
          >
            {sweepLoading ? "Processing..." : "Confirm Sweep"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FundManagement;
