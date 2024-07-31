# Not Diamond Template

This is a template for building an AI chat app powered by Not Diamond.

## Requirements

Get a Not Diamond API key from [Not Diamond](https://app.notdiamond.ai/keys).

## Running Locally

**1. Clone Repo**

```bash
git clone https://github.com/mckaywrigley/not-diamond-template.git
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

## Deploying to Production

## Contact
