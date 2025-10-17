'use client';

import {useEffect, useState} from 'react';
import Image from "next/image";
import {cn, configureAssistant, getSubjectColor} from "@/lib/utils";
import vapi from "@/lib/vapi.sdk";

/**
 * Call status enumeration
 * Tracks the current state of the voice call session
 */
enum CallStatus {
  INACTIVE = 'INACTIVE',     // No active call
  CONNECTING = 'CONNECTING', // Establishing connection
  ACTIVE = 'ACTIVE',         // Call in progress
  FINISHED = 'FINISHED',     // Call ended
}

/**
 * CompanionVoiceChat Component
 *
 * Manages real-time voice conversations between users and AI companions.
 * Features:
 * - Voice call initiation and management via VAPI
 * - Real-time transcription display
 * - Microphone controls (mute/unmute)
 * - Visual feedback for call states
 * - Session history tracking
 */
const CompanionVoiceChat = ({
                              companionId,
                              subject,
                              topic,
                              name,
                              userName,
                              userImage,
                              style,
                              voice
                            }: CompanionComponentProps) => {
  // Call state management
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Transcript messages (newest first)
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  /**
   * Setup VAPI event listeners for voice call management
   * Handles call lifecycle, transcription, and speech detection
   */
  useEffect(() => {
    // Call started successfully
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);

    // Call ended - save to history
    const onCallEnd = async () => setCallStatus(CallStatus.FINISHED);

    // Process incoming messages and transcripts
    const onMessage = (message: Message) => {

      // Only save final transcripts (ignore partial)
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage = {role: message.role, content: message.transcript};

        // Add to beginning of array for reverse chronological order
        setMessages((prev) => [newMessage, ...prev]);
      }
    };

    // Track when assistant starts/stops speaking
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    // Log any VAPI errors
    const onError = (error: Error) => console.error('VAPI Error:', error);

    // Register all event listeners
    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('message', onMessage);
    vapi.on('error', onError);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);

    // Cleanup: Remove all listeners on component unmount
    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('message', onMessage);
      vapi.off('error', onError);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
    };
  }, [companionId]);

  /**
   * Toggle microphone mute state
   * Syncs with VAPI and updates UI
   */
  const toggleMicrophone = () => {
    const currentMuteState = vapi.isMuted();
    vapi.setMuted(!currentMuteState);
    setIsMuted(!currentMuteState);
  };

  /**
   * Initiate voice call with AI companion
   * Configures assistant with subject, topic, and style parameters
   */
  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    // Configure assistant behavior and context
    const assistantOverrides = {
      variableValues: {subject, topic, style},
      clientMessages: ["transcript"], // Request transcription
      serverMessages: [],
    };

    try {
      // Start VAPI call with configured assistant
      // @ts-expect-error - VAPI SDK type mismatch
      await vapi.start(configureAssistant(voice, style), assistantOverrides);
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  /**
   * End the active voice call
   */
  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);

    try {
      await vapi.stop();
    } catch (error) {
      console.error('Failed to stop call:', error);
    }
  };

  // Simple bot display name - just use "Bot" for clarity
  const botName = "AI";

  return (
    <section className="flex flex-col h-[70vh]">
      {/* Main interaction area with companion and user controls */}
      <section className="flex gap-8 max-sm:flex-col">

        {/* Companion avatar section */}
        <div className="companion-section">
          <div
            className="companion-avatar relative flex items-center justify-center"
            style={{backgroundColor: getSubjectColor(subject)}}
          >
            {/* Animate speak pulse */}
            {callStatus === CallStatus.ACTIVE && isSpeaking && (
              <div
                className="absolute top-1/2 left-1/2 w-5/6 h-5/6 -translate-x-1/2 -translate-y-1/2 rounded-full animate-speak"/>
            )}

            {/* Avatar image */}
            <Image
              src={`/icons/${subject}.svg`}
              alt={subject}
              width={150}
              height={150}
              className={cn(
                "transition-all duration-1000 ease-in-out max-sm:w-fit",
                {
                  "animate-pulse": callStatus === CallStatus.CONNECTING,
                }
              )}
            />
          </div>

          <p className="font-bold text-2xl text-center truncate max-w-full">{name}</p>
        </div>

        {/* User controls section */}
        <div className="user-section">
          {/* User profile display */}
          <div className="user-avatar">
            <Image
              src={userImage}
              alt={userName}
              width={130}
              height={130}
              className="rounded-lg"
            />
            <p className="font-bold text-2xl">{userName}</p>
          </div>

          {/* Microphone control - only active during call */}
          <button
            className="btn-mic"
            onClick={toggleMicrophone}
            disabled={callStatus !== CallStatus.ACTIVE}
          >
            <Image
              src={isMuted ? '/icons/mic-off.svg' : '/icons/mic-on.svg'}
              alt="mic"
              width={36}
              height={36}
            />
            <p className="max-sm:hidden">
              {isMuted ? 'Turn on microphone' : 'Turn off microphone'}
            </p>
          </button>

          {/* Primary call control button */}
          <button
            className={cn(
              'rounded-lg py-2 cursor-pointer transition-colors w-full text-white',
              // Red when active (for ending), primary otherwise
              callStatus === CallStatus.ACTIVE ? 'bg-red-700' : 'bg-primary',
              // Pulse animation while connecting
              callStatus === CallStatus.CONNECTING && 'animate-pulse'
            )}
            onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}
          >
            {callStatus === CallStatus.ACTIVE
              ? "End Session"
              : callStatus === CallStatus.CONNECTING
                ? 'Connecting'
                : 'Start Session'}
          </button>
        </div>
      </section>

      {/* Real-time transcript display */}
      <section className="transcript">
        <div className="transcript-message no-scrollbar">
          {/* Display messages in reverse chronological order */}
          {messages.map((message, index) => {
            if (message.role === 'assistant') {
              return (
                <p key={index} className="max-sm:text-sm mb-2">
                  <strong>{botName}:</strong> {message.content}
                </p>
              );
            } else {
              return (
                <p key={index} className="text-primary max-sm:text-sm mb-2">
                  <strong>{userName}:</strong> {message.content}
                </p>
              );
            }
          })}
        </div>

        {/* Fade overlay for visual depth */}
        <div className="transcript-fade"/>
      </section>
    </section>
  );
};

export default CompanionVoiceChat;