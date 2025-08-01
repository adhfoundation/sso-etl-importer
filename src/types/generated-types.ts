// Gerado automaticamente a partir de dados.json

export interface RootObject {
  _id?: {
    $oid?: string;
    [k: string]: unknown;
  };
  rmDegreeId?: string;
  firstName?: string;
  affiliateId?: string;
  branchId?: string;
  lastName?: string;
  type?: string;
  personal?: {
    birthDate?: {
      $date?: {
        $numberLong?: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    documents?: {
      documentType?: string;
      number?: string;
      _id?: {
        $oid?: string;
        [k: string]: unknown;
      };
      created?: {
        $date?: string;
        [k: string]: unknown;
      };
      modified?: {
        $date?: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  contact?: {
    mainAddress?: number;
    addresses?: {
      [k: string]: unknown;
    }[];
    mainPhone?: number;
    billingPhone?: number;
    deliveryPhone?: number;
    phones?: {
      number?: string;
      prefix?: string;
      countryCode?: string;
      _id?: {
        $oid?: string;
        [k: string]: unknown;
      };
      created?: {
        $date?: string;
        [k: string]: unknown;
      };
      modified?: {
        $date?: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    }[];
    mainEmail?: number;
    emails?: {
      name?: string;
      _id?: {
        $oid?: string;
        [k: string]: unknown;
      };
      created?: {
        $date?: string;
        [k: string]: unknown;
      };
      modified?: {
        $date?: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    }[];
    allowedMethods?: {
      email?: boolean;
      sms?: boolean;
      whatsapp?: boolean;
      _id?: {
        $oid?: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  academic?: {
    institutionsOfInterest?: {
      [k: string]: unknown;
    }[];
    preferences?: {
      [k: string]: unknown;
    }[];
    preference?: {
      [k: string]: unknown;
    }[];
    purpose?: {
      [k: string]: unknown;
    }[];
    disciplines?: {
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  account?: {
    email?: string;
    password?: string;
    username?: string;
    oauth?: {
      [k: string]: unknown;
    }[];
    forcePasswordReset?: boolean;
    [k: string]: unknown;
  };
  relationship?: {
    created?: {
      $date?: string;
      [k: string]: unknown;
    };
    modified?: {
      $date?: string;
      [k: string]: unknown;
    };
    interactions?: {
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  contracts?: {
    [k: string]: unknown;
  }[];
  deviceSettings?: {
    livesNotificationPreferences?: {
      sendNotificationsPreference?: {
        [k: string]: unknown;
      }[];
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  gender?: string;
  pendingCourseUnits?: {
    [k: string]: unknown;
  }[];
  dateToEndStationAccount?: {
    [k: string]: unknown;
  };
  dateToEndAccount?: {
    [k: string]: unknown;
  };
  chronogramSettings?: {
    endOfInternshipChronogram?: {
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  lastChronogramRefresh?: {
    [k: string]: unknown;
  }[];
  devices?: {
    [k: string]: unknown;
  }[];
  group?: {
    [k: string]: unknown;
  }[];
  activityGroups?: {
    [k: string]: unknown;
  }[];
  registersExpirationStatus?: {
    [k: string]: unknown;
  }[];
  studyProfiling?: {
    [k: string]: unknown;
  }[];
  playlistMethodologyStep?: {
    [k: string]: unknown;
  }[];
  thirdPartyIntegration?: {
    [k: string]: unknown;
  }[];
  createdAt?: {
    $date?: string;
    [k: string]: unknown;
  };
  updatedAt?: {
    $date?: string;
    [k: string]: unknown;
  };
  __v?: number;
  [k: string]: unknown;
}
