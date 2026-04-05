# AI Governance

## AI Model Usage

Claudsy Memory uses Ollama for structured extraction with the following models:

- **Primary:** nuextract (specialized for extraction)
- **Fallback:** llama3.1:8b (general purpose)

## Data Privacy

- No user data is sent to external AI services
- All processing happens locally via Ollama
- Facts are stored locally in user directory

## Ethical Considerations

- Memory extraction respects conversation context
- Facts are categorized to prevent misuse
- No personal identifiable information should be stored

## Model Governance

- Models are open-source and locally hosted
- No API keys or external dependencies
- Fallback ensures reliability

## Monitoring

- Health checks verify AI service availability
- Logs track extraction success/failure
- Performance metrics monitored

## Compliance

- Local-only operation avoids data residency issues
- No cloud AI services used
- User controls all data
