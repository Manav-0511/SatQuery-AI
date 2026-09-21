import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import * as api from '../lib/api';

// Mock the API module
jest.mock('../lib/api', () => ({
  analyze: jest.fn()
}));

const mockAnalyze = api.analyze as jest.Mock;

describe('SatQuery AI Frontend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Analyze button is disabled when empty', () => {
    render(<Home />);
    const button = screen.getByRole('button', { name: /analyze imagery/i });
    expect(button).toBeDisabled();
  });

  test('Analyze button enables when image and query are present', () => {
    render(<Home />);
    
    const fileInput = screen.getByLabelText(/upload satellite images/i);
    const file = new File(['dummy content'], 'test.tif', { type: 'image/tiff' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const queryInput = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(queryInput, { target: { value: 'Where is the water?' } });

    const button = screen.getByRole('button', { name: /analyze imagery/i });
    expect(button).not.toBeDisabled();
  });

  test('Handles mock specialist label and API success', async () => {
    mockAnalyze.mockResolvedValue({
      status: 'COMPLETED',
      response: {
        task: 'VQA',
        answer: 'TEST_ONLY_RESULT',
        confidence: null,
        evidence: [],
        model: { name: 'test-vqa', version: '1.0' },
        provenance: { synthetic: true, is_real_data: false }
      },
      trace: {
        steps: [{ component: 'executor', action: 'SPECIALIST_EXECUTION_COMPLETED', status: 'COMPLETED' }],
        totalTimeMs: 100
      }
    });

    render(<Home />);
    
    const fileInput = screen.getByLabelText(/upload satellite images/i);
    const file = new File(['dummy content'], 'test.tif', { type: 'image/tiff' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const queryInput = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(queryInput, { target: { value: 'Is there water?' } });

    const button = screen.getByRole('button', { name: /analyze imagery/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('TEST / DEMO SPECIALIST')).toBeInTheDocument();
    });

    expect(screen.getByText('TEST_ONLY_RESULT')).toBeInTheDocument();
    expect(screen.getByText('Confidence not provided by specialist.')).toBeInTheDocument();
    expect(screen.getByText('No spatial evidence was provided by the specialist.')).toBeInTheDocument();
  });
  
  test('Handles validation failure', async () => {
    mockAnalyze.mockResolvedValue({
      status: 'VALIDATION_FAILED',
      errors: ['NO_INPUT: At least one input is required']
    });

    render(<Home />);
    
    const fileInput = screen.getByLabelText(/upload satellite images/i);
    const file = new File(['dummy content'], 'test.tif', { type: 'image/tiff' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const queryInput = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(queryInput, { target: { value: 'Test query' } });

    const button = screen.getByRole('button', { name: /analyze imagery/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/NO_INPUT/i)).toBeInTheDocument();
    });
  });
});
