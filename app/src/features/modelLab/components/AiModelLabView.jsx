import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ModelHeroSection } from './ModelHeroSection'
import { DatasetAnalysisSection } from './DatasetAnalysisSection'
import { PreprocessingPipelineSection } from './PreprocessingPipelineSection'
import { InteractiveDecisionTree } from './InteractiveDecisionTree'
import { AiRecommendationSection } from './AiRecommendationSection'
import { LeaderboardCardsSection } from './LeaderboardCardsSection'
import { InteractiveRadarSection } from './InteractiveRadarSection'
import { TradeoffMatrixSection } from './TradeoffMatrixSection'
import { IndustryUseCasesSection } from './IndustryUseCasesSection'
import { WhatIfSimulatorSection } from './WhatIfSimulatorSection'
import { ExplainabilitySection } from './ExplainabilitySection'
import { VisualizationsSection } from './VisualizationsSection'
import { HyperparameterLabSection } from './HyperparameterLabSection'
import { LearningModeModal } from './LearningModeModal'
import { ExportReportSection } from './ExportReportSection'
import { AtlasAiCoach } from './AtlasAiCoach'

import { parseCSV, analyzeDataset, runAutoMlTraining } from '../engine/modelAnalysisEngine'
import { SAMPLE_DATASETS } from '../engine/sampleDatasets'
import { useGSAPAnimations } from '../../../hooks/useGSAPAnimations'
import '../styles/modelLab.css'

export default function AiModelLabView() {
  const containerRef = useRef(null)

  const [selectedSampleId, setSelectedSampleId] = useState(SAMPLE_DATASETS[0].id)
  const [analysis, setAnalysis] = useState(null)
  const [trainingResults, setTrainingResults] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedLearningModel, setSelectedLearningModel] = useState(null)
  const [whatIfState, setWhatIfState] = useState({ missingPct: 0, noiseLevel: 0 })

  useGSAPAnimations(containerRef)

  // Auto-run analysis on default sample dataset on load
  useEffect(() => {
    loadSampleDataset(SAMPLE_DATASETS[0])
  }, [])

  const loadSampleDataset = (sample) => {
    setSelectedSampleId(sample.id)
    setIsAnalyzing(true)

    setTimeout(() => {
      const parsed = parseCSV(sample.csvContent)
      if (parsed) {
        const ana = analyzeDataset(parsed.headers, parsed.rows, sample.targetColumn)
        setAnalysis(ana)
        const tr = runAutoMlTraining(ana, whatIfState)
        setTrainingResults(tr)
      }
      setIsAnalyzing(false)
    }, 400)
  }

  const [uploadError, setUploadError] = useState(null)

  const handleFileUpload = (file) => {
    if (!file) return
    setUploadError(null)

    // File size safety check: Cap at 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller dataset.`)
      return
    }

    setIsAnalyzing(true)
    setSelectedSampleId(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvStr = e.target.result
        const parsed = parseCSV(csvStr)
        if (parsed && parsed.rows.length > 0) {
          const ana = analyzeDataset(parsed.headers, parsed.rows, null)
          setAnalysis(ana)
          const tr = runAutoMlTraining(ana, whatIfState)
          setTrainingResults(tr)
        } else {
          setUploadError('Invalid or empty CSV file format. Please ensure valid headers and data rows.')
        }
      } catch (err) {
        setUploadError(`Failed to parse CSV file: ${err.message}`)
      } finally {
        setIsAnalyzing(false)
      }
    }
    reader.onerror = () => {
      setUploadError('Error reading dataset file from device.')
      setIsAnalyzing(false)
    }
    reader.readAsText(file)
  }

  const handleTargetChange = (newTarget) => {
    if (!analysis) return
    setIsAnalyzing(true)
    setTimeout(() => {
      const sample = SAMPLE_DATASETS.find(s => s.id === selectedSampleId)
      const parsed = sample ? parseCSV(sample.csvContent) : null
      if (parsed) {
        const ana = analyzeDataset(parsed.headers, parsed.rows, newTarget)
        setAnalysis(ana)
        const tr = runAutoMlTraining(ana, whatIfState)
        setTrainingResults(tr)
      }
      setIsAnalyzing(false)
    }, 200)
  }

  const handleWhatIfChange = (newOverrides) => {
    setWhatIfState(newOverrides)
    if (analysis) {
      const tr = runAutoMlTraining(analysis, newOverrides)
      setTrainingResults(tr)
    }
  }

  return (
    <div className="ml-canvas" ref={containerRef}>
      <div className="ml-container">
        {/* HERO SECTION & DATASET UPLOAD */}
        <ModelHeroSection
          onFileUpload={handleFileUpload}
          onSelectSample={loadSampleDataset}
          selectedSampleId={selectedSampleId}
          isAnalyzing={isAnalyzing}
        />

        {uploadError && (
          <div style={{ margin: '1rem 0 1.5rem', padding: '0.85rem 1.25rem', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.14)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#fca5a5', fontSize: '0.88rem', fontWeight: 600 }}>
            ⚠️ Dataset Upload Error: {uploadError}
          </div>
        )}

        {/* DATASET INTELLIGENCE & AUTOMATED ANALYSIS */}
        {analysis && (
          <DatasetAnalysisSection
            analysis={analysis}
            onTargetChange={handleTargetChange}
          />
        )}

        {/* INTERACTIVE DECISION TREE FLOW DIAGRAM */}
        {analysis && (
          <InteractiveDecisionTree
            path={analysis.decisionPath}
          />
        )}

        {/* AUTOMATED PREPROCESSING PIPELINE */}
        {analysis && (
          <PreprocessingPipelineSection
            steps={analysis.preprocessingSteps}
          />
        )}

        {/* ATLAS AI SCIENTIFIC RECOMMENDATION ENGINE */}
        {trainingResults && analysis && (
          <AiRecommendationSection
            recommendation={trainingResults.recommendation}
            winner={trainingResults.winner}
            analysis={analysis}
          />
        )}

        {/* MODEL EVALUATION LEADERBOARD SHOWCASE (3D GLASS CARDS) */}
        {trainingResults && analysis && (
          <LeaderboardCardsSection
            evaluatedModels={trainingResults.evaluatedModels}
            onSelectLearnMore={(modelName) => setSelectedLearningModel(modelName)}
            problemType={analysis.problemType}
          />
        )}

        {/* MULTI-DIMENSIONAL RADAR COMPARISON */}
        {trainingResults && (
          <InteractiveRadarSection
            evaluatedModels={trainingResults.evaluatedModels}
          />
        )}

        {/* INTERACTIVE TRADEOFF MATRIX MAP */}
        {trainingResults && (
          <TradeoffMatrixSection
            evaluatedModels={trainingResults.evaluatedModels}
          />
        )}

        {/* REAL-WORLD ENTERPRISE ADOPTION */}
        {trainingResults && (
          <IndustryUseCasesSection
            winner={trainingResults.winner}
          />
        )}

        {/* INTERACTIVE "WHAT-IF?" SIMULATOR */}
        {analysis && (
          <WhatIfSimulatorSection
            onWhatIfChange={handleWhatIfChange}
          />
        )}

        {/* INTERACTIVE VISUALIZATIONS */}
        {trainingResults && analysis && (
          <VisualizationsSection
            featureImportances={trainingResults.featureImportances}
            correlations={analysis.correlations}
          />
        )}

        {/* SHAP & LIME EXPLAINABILITY */}
        {trainingResults && (
          <ExplainabilitySection
            winner={trainingResults.winner}
            featureImportances={trainingResults.featureImportances}
          />
        )}

        {/* LIVE HYPERPARAMETER TUNING PLAYGROUND */}
        {trainingResults && (
          <HyperparameterLabSection
            winner={trainingResults.winner}
          />
        )}

        {/* DOWNLOADABLE AUTOML OUTPUTS & CODE EXPORT */}
        {analysis && trainingResults && (
          <ExportReportSection
            analysis={analysis}
            trainingResults={trainingResults}
          />
        )}

        {/* EDUCATIONAL DEEP DIVE MODAL */}
        <LearningModeModal
          modelName={selectedLearningModel}
          onClose={() => setSelectedLearningModel(null)}
        />

        {/* ATLAS AI FLOATING COACH */}
        {analysis && (
          <AtlasAiCoach
            winner={trainingResults?.winner}
            analysis={analysis}
          />
        )}
      </div>
    </div>
  )
}
