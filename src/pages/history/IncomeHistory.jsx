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

const IncomeHistory = () => {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [incomeHistory, setIncomeHistory] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    type: "",
    userId: "",
    uid: "",
    email: "",
  });

  const fetchIncome = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };

      const response = await adminService.getIncomeHistory(params);

      if (response.success) {
        setIncomeHistory(response.data || []);
        setPagination(response.pagination || pagination);
      }
    } catch (error) {
      console.error("Error fetching income:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to fetch income history",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome(1);
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    fetchIncome(1);
  };

  const handlePageChange = (event, value) => {
    fetchIncome(value);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 0.5 }}>
          Income History
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          View all income transactions including referral bonuses
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
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                label="Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="REFERRAL_BONUS">Referral Bonus</MenuItem>
                <MenuItem value="LEVEL_INCOME">Level Income</MenuItem>
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

      {/* Income Table */}
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
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Created At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {incomeHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
                            No income records found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      incomeHistory.map((income) => (
                        <TableRow key={income._id || income.id} hover>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                              {income._id || income.id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {income.user?.email || income.email || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={income.type || "N/A"}
                              size="small"
                              sx={{
                                bgcolor: theme.palette.primary.main + "1A",
                                color: theme.palette.primary.main,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                              ${income.amount || "0.00"}
                            </Typography>
                          </TableCell>
                          <TableCell>{income.description || "N/A"}</TableCell>
                          <TableCell>
                            {income.createdAt
                              ? new Date(income.createdAt).toLocaleString()
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

export default IncomeHistory;
