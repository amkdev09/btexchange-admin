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

const DepositsHistory = () => {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    userId: "",
    uid: "",
    email: "",
  });

  const fetchDeposits = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };

      const response = await adminService.getDepositsHistory(params);

      if (response.success) {
        setDeposits(response.data || []);
        setPagination(response.pagination || pagination);
      }
    } catch (error) {
      console.error("Error fetching deposits:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to fetch deposits",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits(1);
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    fetchDeposits(1);
  };

  const handlePageChange = (event, value) => {
    fetchDeposits(value);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
      case "CONFIRMED":
        return { bgcolor: theme.palette.success.main + "1A", color: theme.palette.success.main };
      case "PENDING":
        return { bgcolor: theme.palette.warning.main + "1A", color: theme.palette.warning.main };
      case "FAILED":
        return { bgcolor: theme.palette.error.main + "1A", color: theme.palette.error.main };
      default:
        return { bgcolor: theme.palette.text.disabled + "1A", color: theme.palette.text.secondary };
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 0.5 }}>
          Deposits History
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          View all deposit transactions
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
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
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
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
              </Select>
            </FormControl>

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
          </Box>
          <Button variant="contained" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {/* Deposits Table */}
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
                      <TableCell>ID</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Chain</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deposits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
                            No deposits found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      deposits.map((deposit) => (
                        <TableRow key={deposit._id || deposit.id} hover>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                              {deposit._id || deposit.id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {deposit.user?.email || deposit.email || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>{deposit.chain || "N/A"}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {deposit.amount || "0.00"} {deposit.currency || "USDT"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                              {deposit.address ? `${deposit.address.slice(0, 10)}...` : "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={deposit.status || "N/A"}
                              size="small"
                              sx={getStatusColor(deposit.status)}
                            />
                          </TableCell>
                          <TableCell>
                            {deposit.createdAt
                              ? new Date(deposit.createdAt).toLocaleString()
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

export default DepositsHistory;
