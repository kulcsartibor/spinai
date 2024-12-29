<div align="center">

![Logo of SpinUp](./docs/SpinUp_logo.png)

# **SpinUp**

🤖 **SpinUp**: A framework that allows you to setup and manage AI agents seamlessly.

<h3>

[Homepage](https://www.spinup.com/) | [Examples](https://github.com/Fallomai/spinup/SpinUp-examples)

</h3>

[![GitHub Repo stars](https://img.shields.io/github/stars/Fallomai/spinup)](https://github.com/Fallomai/spinup)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

</div>

## Table of contents

- [Why SpinUp?](#why-SpinUp)
- [Getting Started](#getting-started)
- [Key Features](#key-features)
- [Examples](#examples)
- [Contribution](#contribution)
- [License](#license)

## Why SpinUp?

SpinUp is a framework that helps you set up and manage teams of AI agents.
Each agent is given a specific role, tools, and tasks to work on, and they all work together to complete complex jobs.

## Getting Started

### 1. Installation

#### Prerequisites

Ensure you have the following installed:

- Node.js >=14
- npm or yarn package manager
- TypeScript >=5.3.3

Install `turbo` globally if you haven't already:

```bash
npm install turbo --global
```

#### Clone and Install

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/Fallomai/spinup.git
cd spinup
```

Install the dependencies:

```bash
npm install
```

### 2. Running the Server

Start the development server:

```bash
npm run dev
```

By default, the server will run on `http://localhost:8080`.

### 3. Using the API

Send a POST request to the endpoint `/api/run/` with the following payload:

**Endpoint:**

```plaintext
http://localhost:8080/api/run/
```

**Request Body:**

```json
{
  "input": "create a new high priority ticket for about the API not working for endpoint /orders"
}
```

## Contribution

SpinUp is an open-source project, and we welcome contributions! If you want to contribute:

1. Fork the repository.
2. Create a new branch for your feature.
3. Make your changes and submit a pull request.

## License

SpinUp is released under the [MIT License](https://opensource.org/licenses/MIT).
