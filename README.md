# AI Router Chat

A template for building an AI chat app that utilizes advanced LLM model routing powered by [Not Diamond](https://www.notdiamond.ai/).

## Demo

See the latest demo [here]().

## Sponsor

If you find AI Router Chat useful, please consider [sponsoring](https://github.com/sponsors/mckaywrigley) us to support my open-source work :)

## Requirements

Get a Not Diamond API key from [Not Diamond](https://app.notdiamond.ai/keys).

You'll also need API keys from each LLM provider (OpenAI, Anthropic, Groq, Perplexity, Google) that you'd like to use.

## Running Locally

**1. Clone Repo**

```bash
git clone https://github.com/mckaywrigley/ai-router-chat.git
```

**2. Setup DB**

[Drizzle w/ Supabase Example](https://orm.drizzle.team/learn/tutorials/drizzle-with-supabase)

```bash
supabase start
```

Copy the connection string (DB URL) from the Supabase output, and paste it into the .env file (see below).

**3. Provide API Keys**

Create a .env file in the root of the repo with these values:

```bash
cp .env.example .env
```

```bash
DATABASE_URL=
NOT_DIAMOND_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
```

**4. Install Dependencies**

```bash
npm i
```

**5. Run App**

```bash
npm run dev
```

## Deploying

Deploy to Vercel in 1 click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmckaywrigley%2Fai-router-chat.git&env=DATABASE_URL,NOT_DIAMOND_API_KEY,OPENAI_API_KEY,ANTHROPIC_API_KEY,GOOGLE_GENERATIVE_AI_API_KEY,GROQ_API_KEY,PERPLEXITY_API_KEY)