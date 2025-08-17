# Texas Hold'em Poker Game

A fullstack Texas Hold'em poker game built with NextJS, TypeScript, FastAPI, and PostgreSQL. This project implements a complete poker game with real-time action logging, hand history, and accurate poker hand evaluation.

## Features

### 🎮 Game Features
- **6-Player Texas Hold'em** with 40 chip big blind
- **Real-time action logging** with detailed play-by-play
- **Complete hand history** saved to database
- **Accurate hand evaluation** using pokerkit library
- **All standard poker actions**: Fold, Check, Call, Bet, Raise, All-in
- **Automatic pot calculation** and winner determination
- **Blind posting** and position rotation

### 🏗️ Technical Features
- **Frontend**: NextJS 14 with React, TypeScript, and shadcn/ui
- **Backend**: Python FastAPI with PostgreSQL database
- **Repository Pattern**: Raw SQL queries (no ORM) as specified
- **Docker Compose**: Complete containerized deployment
- **RESTful API**: Clean API design with proper error handling
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS

## Project Structure

```
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI app entry point
│   ├── database.py         # Database connection and initialization
│   ├── models.py           # Data models using @dataclass
│   ├── game_logic.py       # Poker game logic and rules
│   ├── repositories/       # Repository pattern implementation
│   │   └── hand_repository.py
│   ├── routers/           # API route handlers
│   │   ├── game_router.py
│   │   └── hand_router.py
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile        # Backend container
├── frontend/              # NextJS frontend
│   ├── app/              # NextJS app directory
│   │   ├── page.tsx      # Main game page
│   │   ├── layout.tsx    # Root layout
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── PokerTable.tsx
│   │   ├── ActionControls.tsx
│   │   ├── ActionLog.tsx
│   │   └── HandHistory.tsx
│   ├── lib/             # Utility functions
│   │   ├── utils.ts     # shadcn/ui utilities
│   │   └── api.ts       # API client functions
│   ├── types/           # TypeScript type definitions
│   │   └── poker.ts
│   ├── package.json     # Node.js dependencies
│   └── Dockerfile       # Frontend container
├── docker-compose.yml   # Multi-service orchestration
└── README.md           # This file
```

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Running with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd poker-game
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development

1. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database Setup**
   ```bash
   # Using Docker for PostgreSQL
   docker run --name poker-db -e POSTGRES_DB=poker_db -e POSTGRES_USER=poker_user -e POSTGRES_PASSWORD=poker_password -p 5432:5432 -d postgres:15
   ```

## How to Play

1. **Start a New Hand**
   - Configure player stacks (default: 6 players with $1000 each)
   - Click "Start New Hand" to begin

2. **Game Flow**
   - **Preflop**: Players receive hole cards, blinds are posted
   - **Flop**: First 3 community cards are dealt
   - **Turn**: 4th community card is dealt
   - **River**: 5th community card is dealt
   - **Showdown**: Winner is determined and pot is awarded

3. **Actions Available**
   - **Fold**: Give up hand
   - **Check**: Pass action (if no bet to call)
   - **Call**: Match current bet
   - **Bet**: Make a bet (minimum big blind)
   - **Raise**: Increase the current bet
   - **All-in**: Bet entire stack

4. **Hand History**
   - Completed hands are automatically saved
   - View detailed action logs and results
   - See community cards and player hands

## API Endpoints

### Game Management
- `POST /api/game/start-hand` - Start a new hand
- `POST /api/game/action` - Make a player action
- `GET /api/game/state` - Get current game state

### Community Cards
- `POST /api/game/deal-flop` - Deal the flop
- `POST /api/game/deal-turn` - Deal the turn
- `POST /api/game/deal-river` - Deal the river
- `POST /api/game/complete-hand` - Complete hand and determine winner

### Hand History
- `GET /api/hands` - Get recent hand history
- `GET /api/hands/{hand_id}` - Get specific hand details
- `GET /api/hands/{hand_id}/actions` - Get actions for a hand

## Technical Implementation

### Backend Architecture
- **FastAPI**: Modern, fast web framework with automatic API documentation
- **Repository Pattern**: Clean separation of data access logic
- **Raw SQL**: Direct database queries for maximum control
- **pokerkit**: Accurate poker hand evaluation library
- **PostgreSQL**: Robust relational database with JSONB support

### Frontend Architecture
- **NextJS 14**: React framework with app directory
- **TypeScript**: Type-safe development
- **shadcn/ui**: Beautiful, accessible UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Real-time Updates**: Immediate UI feedback for all actions

### Database Schema
```sql
-- Hands table
CREATE TABLE hands (
    id SERIAL PRIMARY KEY,
    hand_id VARCHAR(50) UNIQUE NOT NULL,
    players JSONB NOT NULL,
    community_cards JSONB NOT NULL,
    pot_amount INTEGER NOT NULL,
    winner JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Actions table
CREATE TABLE actions (
    id SERIAL PRIMARY KEY,
    hand_id VARCHAR(50) NOT NULL,
    player_name VARCHAR(100) NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    amount INTEGER,
    street VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hand_id) REFERENCES hands(hand_id)
);
```

## Development

### Code Style
- **Python**: PEP8 compliance
- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **SQL**: Clear, readable queries with proper indexing

### Testing
- **Backend**: API integration tests
- **Frontend**: Component and E2E tests
- **Database**: Schema validation and data integrity

### Deployment
- **Docker Compose**: Production-ready containerization
- **Environment Variables**: Configurable settings
- **Health Checks**: Service monitoring
- **Logging**: Comprehensive error tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **pokerkit**: For accurate poker hand evaluation
- **shadcn/ui**: For beautiful UI components
- **FastAPI**: For the excellent web framework
- **NextJS**: For the React framework
