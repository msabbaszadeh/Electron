# Advanced Settings Documentation

## Overview

This document describes the advanced settings feature that provides fine-grained control over AI model parameters for enhanced customization and performance tuning.

## Features

### 1. Top-P (Nucleus Sampling)
- **Range**: 0.1 to 1.0
- **Default**: 0.9
- **Description**: Controls the diversity of generated text by sampling from the most probable tokens whose cumulative probability exceeds the threshold.
- **Usage**: 
  - Lower values (0.1-0.7): More focused, conservative outputs
  - Higher values (0.8-1.0): More diverse, creative outputs

### 2. Max Tokens Generation
- **Range**: 1 to 4096 (or unlimited)
- **Default**: null (unlimited)
- **Description**: Sets the maximum number of tokens the AI model can generate in a single response.
- **Usage**:
  - Leave empty for unlimited generation
  - Set specific value to control response length
  - Useful for preventing overly long responses

### 3. Creativity Temperature (Enhanced)
- **Range**: 0 to 2
- **Default**: 0.7
- **Description**: Controls randomness in token selection, now integrated with other advanced parameters.
- **Usage**:
  - 0.0-0.3: Highly deterministic, focused responses
  - 0.4-0.8: Balanced creativity and coherence
  - 0.9-2.0: Highly creative, varied responses

## Preset Configurations

### Creative Mode
- Temperature: 1.2
- Top-P: 0.95
- Max Tokens: 500
- **Best for**: Creative writing, brainstorming, artistic content

### Balanced Mode (Default)
- Temperature: 0.7
- Top-P: 0.9
- Max Tokens: Unlimited
- **Best for**: General conversation, balanced responses

### Precise Mode
- Temperature: 0.3
- Top-P: 0.7
- Max Tokens: 200
- **Best for**: Technical questions, factual responses, code generation

### Unlimited Mode
- Temperature: 0.7
- Top-P: 0.9
- Max Tokens: Unlimited
- **Best for**: Long-form content, detailed explanations

## Integration with AI Services

The advanced settings are integrated with the following AI services:

### OpenAI Service
- Uses `temperature`, `top_p`, and `max_tokens` parameters
- Full compatibility with all advanced settings

### Alibaba Cloud Service
- Uses `temperature`, `top_p`, and `max_tokens` parameters
- Maps to Alibaba's parameter format

### Hugging Face Service
- Uses `temperature`, `top_p`, and `max_new_tokens` parameters
- Compatible with Hugging Face's inference API

### Ollama Service
- Uses `temperature`, `top_p`, and `num_predict` parameters
- Full local model support for advanced settings

### Gemini Service
- Currently uses default parameters
- Future updates will include advanced parameter support

## Factory Reset Feature

### Functionality
- Resets all advanced settings to factory defaults
- Preserves other settings (API keys, models, etc.)
- Includes confirmation dialog to prevent accidental resets

### Default Values
- Creativity Temperature: 0.7
- Top-P: 0.9
- Max Tokens: null (unlimited)

## Testing Interface

A comprehensive test interface is available at `test_advanced_settings.html` that provides:

### Features
- Interactive parameter adjustment
- Real-time API testing with OpenAI
- Preset configuration buttons
- Response analysis and token usage statistics
- Factory reset functionality

### Usage
1. Open `test_advanced_settings.html` in a web browser
2. Enter your OpenAI API key
3. Adjust parameters using sliders and inputs
4. Enter a test prompt
5. Click "Test Advanced Settings" to see results
6. Compare different parameter combinations

## API Integration

### Settings Structure
```typescript
interface AdvancedSettings {
  creativityTemperature: number;  // 0-2, default: 0.7
  topP: number;                   // 0.1-1.0, default: 0.9
  maxTokens: number | null;       // 1-4096 or null, default: null
}
```

### Service Implementation
All AI services now include:
```typescript
const { creativityTemperature = 0.7, topP = 0.9, maxTokens = null } = settings.advanced || {};
```

### Usage in API Calls
```typescript
// OpenAI example
{
  model: model,
  messages: [...],
  temperature: creativityTemperature,
  top_p: topP,
  max_tokens: maxTokens || undefined
}

// Alibaba example
{
  parameters: {
    temperature: creativityTemperature,
    max_tokens: maxTokens || undefined,
    top_p: topP
  }
}
```

## Best Practices

### 1. Parameter Combinations
- **Creative + Long**: High temperature, high top-P, unlimited tokens
- **Technical + Short**: Low temperature, low top-P, limited tokens
- **Balanced**: Default settings work well for most use cases

### 2. Model-Specific Considerations
- **GPT models**: Respond well to temperature 0.7-1.0 for creative tasks
- **Code models**: Benefit from lower temperature (0.2-0.5) for accuracy
- **Local models**: May require different parameter ranges

### 3. Performance Optimization
- Use token limits to control costs and response times
- Adjust top-P for better diversity without sacrificing coherence
- Combine temperature and top-P for fine-tuned control

## Troubleshooting

### Common Issues
1. **No response change**: Ensure API key is valid and model supports parameters
2. **Too short responses**: Check max tokens setting or remove limit
3. **Inconsistent results**: Temperature may be too high, try lowering to 0.5-0.7

### Parameter Conflicts
- Temperature and top-P work together but can conflict at extreme values
- Very low temperature + very high top-P may produce inconsistent results
- Very high temperature + very low top-P may limit creativity

## Future Enhancements

### Planned Features
- Frequency penalty controls
- Presence penalty settings
- Stop sequence configuration
- Model-specific parameter presets
- Advanced parameter scheduling

### Integration Improvements
- Real-time parameter validation
- Parameter combination recommendations
- Advanced analytics and usage tracking
- Custom parameter profiles

## Conclusion

The advanced settings feature provides powerful control over AI model behavior while maintaining ease of use through preset configurations and intuitive controls. The integration across multiple AI services ensures consistent behavior regardless of the chosen backend.

For technical support or feature requests, please refer to the main project documentation.