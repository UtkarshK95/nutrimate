# Nutrimate

Nutrimate is a web application designed to help users manage and track their nutrition. Built with Next.js and TypeScript, it leverages Retrieval-Augmented Generation (RAG) based Generative AI to provide advanced insights and recommendations, offering an intuitive interface for meal planning, nutrient tracking, and personalized health advice.

## Features

- **AI-Powered Nutrient Tracker**: Log meals and monitor nutritional intake with AI-driven insights.
- **Personalized Recommendations**: Get diet suggestions based on your preferences, health goals, and real-time data.
- **Interactive Dashboard**: Visualize nutrient intake through dynamic charts.
- **Responsive Design**: Optimized for desktops, tablets, and mobile devices.

## Installation

To set up and run the project locally, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/nutrimate.git
   cd nutrimate
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and provide the necessary configurations. Example:

   ```env
   API_URL=https://api.example.com
   NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

5. **Build for production** (optional):

   ```bash
   npm run build
   npm start
   ```

## Folder Structure

```
nutrimate/
├── app/               # Main application code (pages, components, styles)
├── data/              # Static data and JSON files
├── scripts/           # Utility scripts
├── public/            # Public assets (images, icons, etc.)
├── .env               # Environment variables
├── package.json       # Project metadata and dependencies
├── tsconfig.json      # TypeScript configuration
├── next.config.ts     # Next.js configuration
└── README.md          # Project documentation
```

## Technologies Used

- **Frontend**: Next.js, React, TypeScript
- **Styling**: CSS Modules, Tailwind CSS (if applicable)
- **AI**: Retrieval-Augmented Generation (RAG) with Generative AI, Python, Langchain and OpenAI
- **Linting and Formatting**: ESLint, Prettier

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)
