export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === "ValidationError") {
    const details = Object.values(error.errors).map((item) => item.message);
    return res.status(400).json({ message: "Please check the submitted details.", errors: details });
  }

  if (error.code === 11000) {
    const fields = Object.keys(error.keyPattern ?? {});
    return res.status(409).json({
      message: fields.includes("email")
        ? "A record with this email already exists."
        : "This record already exists.",
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ message: "The requested record is invalid." });
  }

  console.error(error);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
}
