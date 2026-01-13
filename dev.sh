#!/bin/bash

# Framework-Agnostic Application - Development Scripts

echo "🚀 Framework-Agnostic Application - Dev Tools"
echo "============================================="
echo ""

# Function to display menu
show_menu() {
    echo "Choose an option:"
    echo ""
    echo "📱 Run Applications:"
    echo "  1) Run React app"
    echo "  2) Run Vue app (after setup)"
    echo "  3) Run Angular app (after setup)"
    echo ""
    echo "🔧 Setup Tasks:"
    echo "  4) Install dependencies"
    echo "  5) Setup Vue"
    echo "  6) Setup Angular"
    echo ""
    echo "🧪 Testing:"
    echo "  7) Run type check"
    echo "  8) Run tests"
    echo ""
    echo "📦 Build:"
    echo "  9) Build React app"
    echo "  10) Build all apps"
    echo ""
    echo "📚 Documentation:"
    echo "  11) View architecture"
    echo "  12) View quick start"
    echo ""
    echo "  0) Exit"
    echo ""
}

# Main loop
while true; do
    show_menu
    read -p "Enter choice: " choice
    echo ""
    
    case $choice in
        1)
            echo "🚀 Starting React development server..."
            npm run dev:react
            ;;
        2)
            echo "🚀 Starting Vue development server..."
            if [ -d "src/ui/vue" ]; then
                npm run dev:vue
            else
                echo "❌ Vue not set up yet. Choose option 5 to set up Vue."
            fi
            ;;
        3)
            echo "🚀 Starting Angular development server..."
            if [ -d "src/ui/angular" ]; then
                npm run dev:angular
            else
                echo "❌ Angular not set up yet. Choose option 6 to set up Angular."
            fi
            ;;
        4)
            echo "📦 Installing dependencies..."
            npm install
            echo "✅ Dependencies installed!"
            ;;
        5)
            echo "🔧 Setting up Vue..."
            echo "📖 Please follow the guide in MIGRATION.md"
            echo "Key steps:"
            echo "  1. npm install vue @vitejs/plugin-vue"
            echo "  2. Create src/ui/vue/ directory"
            echo "  3. Follow MIGRATION.md for complete setup"
            ;;
        6)
            echo "🔧 Setting up Angular..."
            echo "📖 Please follow the guide in MIGRATION.md"
            echo "Key steps:"
            echo "  1. Create src/ui/angular/ directory"
            echo "  2. Install Angular dependencies"
            echo "  3. Follow MIGRATION.md for complete setup"
            ;;
        7)
            echo "🔍 Running type check..."
            npm run type-check
            ;;
        8)
            echo "🧪 Running tests..."
            npm test
            ;;
        9)
            echo "📦 Building React app..."
            npm run build:react
            echo "✅ Build complete! Check dist/react/"
            ;;
        10)
            echo "📦 Building all apps..."
            npm run build:react
            [ -d "src/ui/vue" ] && npm run build:vue
            [ -d "src/ui/angular" ] && npm run build:angular
            echo "✅ All builds complete!"
            ;;
        11)
            echo "📖 Opening ARCHITECTURE.md..."
            if command -v cat &> /dev/null; then
                cat ARCHITECTURE.md | head -50
                echo ""
                echo "... (showing first 50 lines)"
                echo "Open ARCHITECTURE.md to read more"
            else
                echo "Please open ARCHITECTURE.md in your editor"
            fi
            ;;
        12)
            echo "📖 Opening QUICKSTART.md..."
            if command -v cat &> /dev/null; then
                cat QUICKSTART.md
            else
                echo "Please open QUICKSTART.md in your editor"
            fi
            ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please try again."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done
