/**
 * Gong API Client
 * https://api.gong.io/v2/
 */

const GONG_API_BASE = "https://api.gong.io/v2";

export interface GongConfig {
  accessKey: string;
  accessKeySecret: string;
}

export interface Call {
  id: string;
  title: string;
  scheduled: string;
  started: string;
  duration: number;
  primaryUserId: string;
  direction: string;
  scope: string;
  media: string;
  language: string;
  workspaceId: string;
  url: string;
}

export interface CallsResponse {
  requestId: string;
  records: {
    cursor?: string;
    totalRecords: number;
    currentPageSize: number;
    currentPageNumber: number;
  };
  calls: Call[];
}

export interface TranscriptEntry {
  speakerId: string;
  topic: string;
  sentences: {
    start: number;
    end: number;
    text: string;
  }[];
}

export interface CallTranscript {
  callId: string;
  transcript: TranscriptEntry[];
}

export interface TranscriptsResponse {
  requestId: string;
  records: {
    cursor?: string;
    totalRecords: number;
    currentPageSize: number;
    currentPageNumber: number;
  };
  callTranscripts: CallTranscript[];
}

export interface User {
  id: string;
  emailAddress: string;
  created: string;
  active: boolean;
  emailAliases: string[];
  trustedEmailAddress: string;
  firstName: string;
  lastName: string;
  title: string;
  phoneNumber: string;
  extension: string;
  personalMeetingUrls: string[];
  settings: {
    webConferencesRecorded: boolean;
    preventWebConferenceRecording: boolean;
    telephonyCallsRecorded: boolean;
    emailsRecorded: boolean;
    preventEmailRecording: boolean;
    nonRecordedMeetingsDefaultPrivacy: string;
    gpiSettings: unknown;
    emailsImported: boolean;
  };
  managerId: string;
  meetingConsentPageUrl: string;
  spokenLanguages: {
    language: string;
    primary: boolean;
  }[];
}

export interface UsersResponse {
  requestId: string;
  records: {
    cursor?: string;
    totalRecords: number;
    currentPageSize: number;
    currentPageNumber: number;
  };
  users: User[];
}

export interface CallDetails {
  metaData: {
    id: string;
    url: string;
    title: string;
    scheduled: string;
    started: string;
    duration: number;
    primaryUserId: string;
    direction: string;
    system: string;
    scope: string;
    media: string;
    language: string;
    workspaceId: string;
    sdrDisposition: string;
    clientUniqueId: string;
    customData: string;
    purpose: string;
    meetingUrl: string;
    isPrivate: boolean;
    calendarEventId: string;
  };
  context: Array<{
    system: string;
    objects: Array<{
      objectType: string;
      objectId: string;
      fields: Array<{ name: string; value: string }>;
      timing: string;
    }>;
  }>;
  parties: Array<{
    id: string;
    emailAddress: string;
    name: string;
    title: string;
    userId: string;
    speakerId: string;
    context: Array<{
      system: string;
      objects: Array<{
        objectType: string;
        objectId: string;
        fields: Array<{ name: string; value: string }>;
      }>;
    }>;
    affiliation: string;
    phoneNumber: string;
    methods: string[];
  }>;
  content: {
    trackers: Array<{
      id: string;
      name: string;
      count: number;
      type: string;
      occurrences: Array<{
        startTime: number;
        speakerId: string;
      }>;
    }>;
    topics: Array<{
      name: string;
      duration: number;
    }>;
    pointsOfInterest: {
      actionItems: Array<{
        snippetStartTime: number;
        snippetEndTime: number;
        speakerIds: string[];
        snippet: string;
      }>;
    };
    brief: string;
    outline: Array<{
      section: string;
      startTime: number;
      duration: number;
      items: Array<{
        text: string;
        startTime: number;
      }>;
    }>;
    callOutcome: {
      id: string;
      category: string;
      name: string;
    };
    keyPoints: Array<{
      text: string;
    }>;
  };
  interaction: {
    speakers: Array<{
      id: string;
      visibility: number;
      talkTime: number;
    }>;
    interactivity: number;
    video: Array<{
      name: string;
      duration: number;
    }>;
    questions: {
      companyCount: number;
      nonCompanyCount: number;
    };
  };
  collaboration: {
    publicComments: Array<{
      id: string;
      audioStartTime: number;
      audioEndTime: number;
      commenterUserId: string;
      comment: string;
      posted: string;
      inReplyTo: string;
      duringCall: boolean;
    }>;
  };
  media: {
    audioUrl: string;
    videoUrl: string;
  };
}

export interface CallDetailsResponse {
  requestId: string;
  records: {
    totalRecords: number;
    currentPageSize: number;
    currentPageNumber: number;
  };
  calls: CallDetails[];
}

export class GongClient {
  private authHeader: string;

  constructor(config: GongConfig) {
    const credentials = Buffer.from(
      `${config.accessKey}:${config.accessKeySecret}`
    ).toString("base64");
    this.authHeader = `Basic ${credentials}`;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const url = `${GONG_API_BASE}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gong API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * List calls with optional filtering
   */
  async listCalls(options?: {
    fromDateTime?: string;
    toDateTime?: string;
    workspaceId?: string;
    cursor?: string;
  }): Promise<CallsResponse> {
    const body: Record<string, unknown> = {
      filter: {},
    };

    if (options?.fromDateTime) {
      body.filter = {
        ...(body.filter as Record<string, unknown>),
        fromDateTime: options.fromDateTime,
      };
    }
    if (options?.toDateTime) {
      body.filter = {
        ...(body.filter as Record<string, unknown>),
        toDateTime: options.toDateTime,
      };
    }
    if (options?.workspaceId) {
      body.filter = {
        ...(body.filter as Record<string, unknown>),
        workspaceId: options.workspaceId,
      };
    }
    if (options?.cursor) {
      body.cursor = options.cursor;
    }

    return this.request<CallsResponse>("POST", "/calls", body);
  }

  /**
   * Get detailed information about specific calls
   */
  async getCallDetails(callIds: string[]): Promise<CallDetailsResponse> {
    const body = {
      filter: {
        callIds,
      },
    };
    return this.request<CallDetailsResponse>(
      "POST",
      "/calls/extensive",
      body
    );
  }

  /**
   * Get transcripts for specific calls
   */
  async getTranscripts(callIds: string[]): Promise<TranscriptsResponse> {
    const body = {
      filter: {
        callIds,
      },
    };
    return this.request<TranscriptsResponse>(
      "POST",
      "/calls/transcript",
      body
    );
  }

  /**
   * List all users
   */
  async listUsers(options?: {
    cursor?: string;
    includeAvatars?: boolean;
  }): Promise<UsersResponse> {
    const body: Record<string, unknown> = {};

    if (options?.cursor) {
      body.cursor = options.cursor;
    }
    if (options?.includeAvatars !== undefined) {
      body.includeAvatars = options.includeAvatars;
    }

    return this.request<UsersResponse>("POST", "/users", body);
  }

  /**
   * Search for calls by various criteria
   */
  async searchCalls(options?: {
    fromDateTime?: string;
    toDateTime?: string;
    workspaceId?: string;
    primaryUserIds?: string[];
    callIds?: string[];
    cursor?: string;
  }): Promise<CallsResponse> {
    const body: Record<string, unknown> = {
      filter: {},
    };

    if (options?.fromDateTime) {
      (body.filter as Record<string, unknown>).fromDateTime =
        options.fromDateTime;
    }
    if (options?.toDateTime) {
      (body.filter as Record<string, unknown>).toDateTime = options.toDateTime;
    }
    if (options?.workspaceId) {
      (body.filter as Record<string, unknown>).workspaceId =
        options.workspaceId;
    }
    if (options?.primaryUserIds?.length) {
      (body.filter as Record<string, unknown>).primaryUserIds =
        options.primaryUserIds;
    }
    if (options?.callIds?.length) {
      (body.filter as Record<string, unknown>).callIds = options.callIds;
    }
    if (options?.cursor) {
      body.cursor = options.cursor;
    }

    return this.request<CallsResponse>("POST", "/calls", body);
  }
}
