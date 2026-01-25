import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
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
  Button,
  Pagination,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import adminService from "../../../services/adminService";
import useSnackbar from "../../../hooks/useSnackbar";

const TradesHistory = () => {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [trades, setTrades] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    pair: "",
    userId: "",
    uid: "",
    email: "",
    startDate: "",
    endDate: "",
  });

  const fetchTrades = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };

      const response = await adminService.getTradesHistory(params);

      if (response.success) {
        setTrades(response.data || []);
        setPagination(response.pagination || pagination);
      }
    } catch (error) {
      console.error("Error fetching trades:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to fetch trades",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades(1);
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    fetchTrades(1);
  };

  const handlePageChange = (event, value) => {
    fetchTrades(value);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "WIN":
        return { bgcolor: theme.palette.success.main + "1A", color: theme.palette.success.main };
      case "LOSS":
        return { bgcolor: theme.palette.error.main + "1A", color: theme.palette.error.main };
      case "OPEN":
        return { bgcolor: theme.palette.primary.main + "1A", color: theme.palette.primary.main };
      default:
        return { bgcolor: theme.palette.text.disabled + "1A", color: theme.palette.text.secondary };
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 0.5 }}>
          Trades History
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          View and filter all user trades
        </Typography>
      </Box>

      {/* Filters */}
      <Card>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Filters
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 2,
              mb: 2,
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="WIN">Win</MenuItem>
                <MenuItem value="LOSS">Loss</MenuItem>
                <MenuItem value="OPEN">Open</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Trading Pair"
              value={filters.pair}
              onChange={(e) => handleFilterChange("pair", e.target.value)}
              placeholder="BTC-USD"
            />

            <TextField
              fullWidth
              size="small"
              label="User ID"
              value={filters.userId}
              onChange={(e) => handleFilterChange("userId", e.target.value)}
            />

            <TextField
              fullWidth
              size="small"
              label="User UID"
              value={filters.uid}
              onChange={(e) => handleFilterChange("uid", e.target.value)}
            />

            <TextField
              fullWidth
              size="small"
              label="Email"
              value={filters.email}
              onChange={(e) => handleFilterChange("email", e.target.value)}
            />

            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Button variant="contained" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {/* Trades Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Trade ID</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Pair</TableCell>
                      <TableCell>Side</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trades.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
                            No trades found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      trades.map((trade) => (
                        <TableRow key={trade._id || trade.id} hover>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                              {trade._id || trade.id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {trade.user?.email || trade.email || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>{trade.pair || "N/A"}</TableCell>
                          <TableCell>
                            <Chip
                              label={trade.side?.toUpperCase() || "N/A"}
                              size="small"
                              sx={{
                                bgcolor:
                                  trade.side?.toLowerCase() === "buy"
                                    ? theme.palette.success.main + "1A"
                                    : theme.palette.error.main + "1A",
                                color:
                                  trade.side?.toLowerCase() === "buy"
                                    ? theme.palette.success.main
                                    : theme.palette.error.main,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">{trade.amount || "N/A"}</TableCell>
                          <TableCell align="right">{trade.price || "N/A"}</TableCell>
                          <TableCell>
                            <Chip
                              label={trade.status || "N/A"}
                              size="small"
                              sx={getStatusColor(trade.status)}
                            />
                          </TableCell>
                          <TableCell>
                            {trade.createdAt
                              ? new Date(trade.createdAt).toLocaleString()
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {pagination.totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TradesHistory;
