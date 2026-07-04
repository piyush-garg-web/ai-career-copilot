// src/components/voice-interview/voice-interview-settings.jsx

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import {
  Mic,
  Video,
  Volume2,
  Gauge,
  Clock,
  Languages,
  Save,
  RotateCcw,
  Settings,
  Camera,
  Monitor,
  Sparkles,
} from "lucide-react";

export function VoiceInterviewSettings({ initialSettings = {}, onSave }) {
  const { t } = useTranslation();
  
  const [settings, setSettings] = useState({
    preferredVoice: initialSettings.preferredVoice || "native",
    speakingSpeed: initialSettings.speakingSpeed || 1.0,
    pitch: initialSettings.pitch || 1.0,
    volume: initialSettings.volume || 1.0,
    difficulty: initialSettings.difficulty || "MEDIUM",
    duration: initialSettings.duration || 15,
    language: initialSettings.language || "en",
    autoSave: initialSettings.autoSave !== undefined ? initialSettings.autoSave : true,
    autoDownloadReport: initialSettings.autoDownloadReport !== undefined ? initialSettings.autoDownloadReport : false,
    microphoneDevice: initialSettings.microphoneDevice || "",
    noiseSuppression: initialSettings.noiseSuppression !== undefined ? initialSettings.noiseSuppression : true,
    enableCamera: initialSettings.enableCamera !== undefined ? initialSettings.enableCamera : false,
    defaultCameraDevice: initialSettings.defaultCameraDevice || "",
    mirrorCamera: initialSettings.mirrorCamera !== undefined ? initialSettings.mirrorCamera : true,
    videoResolution: initialSettings.videoResolution || "720p",
    frameRate: initialSettings.frameRate || 30,
    showLivePreview: initialSettings.showLivePreview !== undefined ? initialSettings.showLivePreview : true,
    enableLiveCoaching: initialSettings.enableLiveCoaching !== undefined ? initialSettings.enableLiveCoaching : true,
    enableVideoAnalytics: initialSettings.enableVideoAnalytics !== undefined ? initialSettings.enableVideoAnalytics : true,
  });
  
  const [availableVoices, setAvailableVoices] = useState([]);
  const [availableMicrophones, setAvailableMicrophones] = useState([]);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load available devices
  useEffect(() => {
    const loadDevices = async () => {
      try {
        // Get voices
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const voices = window.speechSynthesis.getVoices();
          setAvailableVoices(voices);
          
          // Load voices on change (Chrome needs this)
          window.speechSynthesis.onvoiceschanged = () => {
            setAvailableVoices(window.speechSynthesis.getVoices());
          };
        }
        
        // Get microphones
        if (navigator.mediaDevices) {
          const audioDevices = await navigator.mediaDevices.enumerateDevices();
          const mics = audioDevices.filter(device => device.kind === 'audioinput');
          setAvailableMicrophones(mics);
          
          const videoDevices = audioDevices.filter(device => device.kind === 'videoinput');
          setAvailableCameras(videoDevices);
        }
      } catch (error) {
        console.error('[SETTINGS] Failed to load devices:', error);
      }
    };
    
    loadDevices();
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const res = await fetch("/api/voice-interview/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Settings saved successfully!");
        setHasChanges(false);
        if (onSave) onSave(data.settings);
      } else {
        toast.error(data.error || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save settings. Please try again.");
      console.error('[SETTINGS] Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      preferredVoice: "native",
      speakingSpeed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      difficulty: "MEDIUM",
      duration: 15,
      language: "en",
      autoSave: true,
      autoDownloadReport: false,
      microphoneDevice: "",
      noiseSuppression: true,
      enableCamera: false,
      defaultCameraDevice: "",
      mirrorCamera: true,
      videoResolution: "720p",
      frameRate: 30,
      showLivePreview: true,
      enableLiveCoaching: true,
      enableVideoAnalytics: true,
    });
    setHasChanges(true);
  };

  const testVoice = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance("This is a test of your voice settings.");
      utterance.rate = settings.speakingSpeed;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;
      utterance.lang = settings.language;
      
      if (settings.preferredVoice && settings.preferredVoice !== "native") {
        const voice = availableVoices.find(v => v.name === settings.preferredVoice || v.lang === settings.preferredVoice);
        if (voice) utterance.voice = voice;
      }
      
      window.speechSynthesis.speak(utterance);
      toast.success("Playing voice test...");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Voice Interview Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your voice interview preferences and device settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || isSaving}
            className="cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="cursor-pointer"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-blue-500" />
            Voice Settings
          </CardTitle>
          <CardDescription>Configure AI voice output preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Selection */}
          <div className="space-y-2">
            <Label>Voice</Label>
            <Select value={settings.preferredVoice} onValueChange={(value) => handleSettingChange("preferredVoice", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="native">Native (Default)</SelectItem>
                {availableVoices.map((voice, idx) => (
                  <SelectItem key={idx} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Speaking Speed */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Speaking Speed</Label>
              <span className="text-sm text-muted-foreground">{settings.speakingSpeed}x</span>
            </div>
            <Slider
              value={[settings.speakingSpeed]}
              onValueChange={([value]) => handleSettingChange("speakingSpeed", value)}
              min={0.5}
              max={2}
              step={0.1}
              className="cursor-pointer"
            />
          </div>

          {/* Pitch */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Pitch</Label>
              <span className="text-sm text-muted-foreground">{settings.pitch}x</span>
            </div>
            <Slider
              value={[settings.pitch]}
              onValueChange={([value]) => handleSettingChange("pitch", value)}
              min={0.5}
              max={2}
              step={0.1}
              className="cursor-pointer"
            />
          </div>

          {/* Volume */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Volume</Label>
              <span className="text-sm text-muted-foreground">{Math.round(settings.volume * 100)}%</span>
            </div>
            <Slider
              value={[settings.volume]}
              onValueChange={([value]) => handleSettingChange("volume", value)}
              min={0}
              max={1}
              step={0.1}
              className="cursor-pointer"
            />
          </div>

          {/* Test Voice Button */}
          <Button variant="outline" onClick={testVoice} className="w-full cursor-pointer">
            <Sparkles className="w-4 h-4 mr-2" />
            Test Voice
          </Button>
        </CardContent>
      </Card>

      {/* Interview Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Gauge className="w-4 h-4 text-green-500" />
            Interview Settings
          </CardTitle>
          <CardDescription>Configure default interview parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Difficulty */}
          <div className="space-y-2">
            <Label>Default Difficulty</Label>
            <Select value={settings.difficulty} onValueChange={(value) => handleSettingChange("difficulty", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Default Duration</Label>
              <span className="text-sm text-muted-foreground">{settings.duration} minutes</span>
            </div>
            <Slider
              value={[settings.duration]}
              onValueChange={([value]) => handleSettingChange("duration", value)}
              min={5}
              max={60}
              step={5}
              className="cursor-pointer"
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="ko">Korean</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Microphone Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Mic className="w-4 h-4 text-purple-500" />
            Microphone Settings
          </CardTitle>
          <CardDescription>Configure audio input preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Microphone Device */}
          <div className="space-y-2">
            <Label>Microphone Device</Label>
            <Select value={settings.microphoneDevice} onValueChange={(value) => handleSettingChange("microphoneDevice", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Default microphone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Default</SelectItem>
                {availableMicrophones.map((mic, idx) => (
                  <SelectItem key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Microphone ${idx + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Noise Suppression */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Noise Suppression</Label>
              <p className="text-xs text-muted-foreground">Reduce background noise during recording</p>
            </div>
            <Switch
              checked={settings.noiseSuppression}
              onCheckedChange={(checked) => handleSettingChange("noiseSuppression", checked)}
              className="cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {/* Video Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Video className="w-4 h-4 text-red-500" />
            Video Settings
          </CardTitle>
          <CardDescription>Configure camera and video analytics (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Camera */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Camera by Default</Label>
              <p className="text-xs text-muted-foreground">Camera is always optional during interviews</p>
            </div>
            <Switch
              checked={settings.enableCamera}
              onCheckedChange={(checked) => handleSettingChange("enableCamera", checked)}
              className="cursor-pointer"
            />
          </div>

          {/* Camera Device */}
          {settings.enableCamera && (
            <div className="space-y-2">
              <Label>Camera Device</Label>
              <Select value={settings.defaultCameraDevice} onValueChange={(value) => handleSettingChange("defaultCameraDevice", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Default camera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default</SelectItem>
                  {availableCameras.map((cam, idx) => (
                    <SelectItem key={cam.deviceId} value={cam.deviceId}>
                      {cam.label || `Camera ${idx + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Mirror Camera */}
          {settings.enableCamera && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mirror Camera</Label>
                <p className="text-xs text-muted-foreground">Show mirrored video feed</p>
              </div>
              <Switch
                checked={settings.mirrorCamera}
                onCheckedChange={(checked) => handleSettingChange("mirrorCamera", checked)}
                className="cursor-pointer"
              />
            </div>
          )}

          {/* Video Resolution */}
          {settings.enableCamera && (
            <div className="space-y-2">
              <Label>Video Resolution</Label>
              <Select value={settings.videoResolution} onValueChange={(value) => handleSettingChange("videoResolution", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="480p">480p (SD)</SelectItem>
                  <SelectItem value="720p">720p (HD)</SelectItem>
                  <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Frame Rate */}
          {settings.enableCamera && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Frame Rate</Label>
                <span className="text-sm text-muted-foreground">{settings.frameRate} FPS</span>
              </div>
              <Slider
                value={[settings.frameRate]}
                onValueChange={([value]) => handleSettingChange("frameRate", value)}
                min={15}
                max={60}
                step={15}
                className="cursor-pointer"
              />
            </div>
          )}

          {/* Show Live Preview */}
          {settings.enableCamera && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Live Preview</Label>
                <p className="text-xs text-muted-foreground">Display camera preview during interview</p>
              </div>
              <Switch
                checked={settings.showLivePreview}
                onCheckedChange={(checked) => handleSettingChange("showLivePreview", checked)}
                className="cursor-pointer"
              />
            </div>
          )}

          {/* Enable Live Coaching */}
          {settings.enableCamera && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Live Coaching</Label>
                <p className="text-xs text-muted-foreground">Show real-time posture and eye contact tips</p>
              </div>
              <Switch
                checked={settings.enableLiveCoaching}
                onCheckedChange={(checked) => handleSettingChange("enableLiveCoaching", checked)}
                className="cursor-pointer"
              />
            </div>
          )}

          {/* Enable Video Analytics */}
          {settings.enableCamera && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Video Analytics</Label>
                <p className="text-xs text-muted-foreground">Include video metrics in final report</p>
              </div>
              <Switch
                checked={settings.enableVideoAnalytics}
                onCheckedChange={(checked) => handleSettingChange("enableVideoAnalytics", checked)}
                className="cursor-pointer"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Monitor className="w-4 h-4 text-orange-500" />
            General Settings
          </CardTitle>
          <CardDescription>Configure general interview behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Save */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Save Interview</Label>
              <p className="text-xs text-muted-foreground">Automatically save interview progress</p>
            </div>
            <Switch
              checked={settings.autoSave}
              onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
              className="cursor-pointer"
            />
          </div>

          {/* Auto Download Report */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Download Report</Label>
              <p className="text-xs text-muted-foreground">Automatically download PDF report after completion</p>
            </div>
            <Switch
              checked={settings.autoDownloadReport}
              onCheckedChange={(checked) => handleSettingChange("autoDownloadReport", checked)}
              className="cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
