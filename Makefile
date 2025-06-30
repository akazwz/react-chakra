.PHONY: clean generate build run test help

# Default target
all: generate build

# Clean generated files and regenerate
generate:
	rm -rf app/gen && buf generate

# Clean only generated files
clean:
	rm -rf gen

# Build the application
build:
	pnpm run build

# Run the application
run:
	pnpm run dev

# Show help
help:
	@echo "Available targets:"
	@echo "  generate  - Clean and regenerate protobuf files"
	@echo "  clean     - Clean generated files"
	@echo "  build     - Build the application"
	@echo "  run       - Run the application"
	@echo "  help      - Show this help message"
