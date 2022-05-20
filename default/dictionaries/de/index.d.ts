declare namespace load {
  /**
   * Object representing a hunspell dictionary, with `aff` and `dic` fields.
   */
  interface Dictionary {
    /**
     * Buffer in UTF-8 for the affix file (defines the language, keyboard, flags, and more).
     */
    aff: Buffer

    /**
     * Buffer in UTF-8 for the dictionary file (contains words and flags applying to those words).
     */
    dic: Buffer
  }

  /**
   * Callback called when dictionary is loaded.
   */
  type Callback = (
    error: NodeJS.ErrnoException | undefined,
    result: Dictionary
  ) => void
}

declare const load: (callback: load.Callback) => void

export = load
