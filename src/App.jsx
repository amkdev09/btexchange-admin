import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import { Provider } from "react-redux";
import { SnackbarProvider } from "./features/snackBar";
import AppRouter from "./router";
import theme from "./utils/theme";
import { store } from "./store/store";
import "./styles/global.scss";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <SnackbarProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <AppRouter />
            </LocalizationProvider>
          </SnackbarProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
