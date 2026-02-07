import express from "express";
import { SerialPort } from "serialport";

const app = express();
app.use(express.json());

// Change this to the COM port your printer uses
const PRINTER_PORT = "COM3"; 
const BAUD_RATE = 9600;

app.post("/print", async (req, res) => {
  const { text } = req.body;

  try {
    const port = new SerialPort({
      path: PRINTER_PORT,
      baudRate: BAUD_RATE
    });

    port.write(text + "\n\n", (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      port.close();
      return res.json({ status: "success", printed: text });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(9100, () => {
  console.log("Print Bridge running at http://localhost:9100");
});
