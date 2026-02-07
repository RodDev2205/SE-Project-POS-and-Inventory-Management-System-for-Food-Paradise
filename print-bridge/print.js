import ThermalPrinter from "node-thermal-printer"; // default import

const printer = ThermalPrinter.printer; // Use the built-in singleton printer instance
const types = ThermalPrinter.types;

// Configure printer
printer.setType(types.EPSON); // or STAR
printer.setInterface("printer:USB Printing Support (JK-58802H)");

// Example receipt
async function printReceipt() {
  try {
    printer.alignCenter();
    printer.bold(true);
    printer.setTextDoubleHeight();
    printer.setTextDoubleWidth();
    printer.println("MY STORE");
    printer.bold(false);
    printer.setTextNormal();
    printer.println("====================");

    const items = [
      { name: "Apple", price: 50 },
      { name: "Banana", price: 30 },
    ];

    items.forEach(item => {
      printer.tableCustom([
        { text: item.name, align: "LEFT", width: 0.7 },
        { text: item.price.toFixed(2), align: "RIGHT", width: 0.3 }
      ]);
    });

    printer.println("--------------------");

    const total = items.reduce((sum, i) => sum + i.price, 0);
    printer.tableCustom([
      { text: "TOTAL", align: "LEFT", width: 0.7 },
      { text: total.toFixed(2), align: "RIGHT", width: 0.3 }
    ]);

    printer.println("\nThank you!\n\n");

    const qrData = "https://example.com";
    const qrString = await QRCode.toString(qrData, { type: "terminal" });
    printer.println(qrString);

    printer.cut();

    await printer.execute();
    console.log("Print job sent successfully!");
  } catch (err) {
    console.error("Printing failed:", err);
  }
}

printReceipt();
