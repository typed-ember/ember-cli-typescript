
declare namespace PathUtils {

  /**
   Returns a relative parent path string using the path provided
   @method getRelativeParentPath
   @param {String} path The path to relatively get to.
   @return {String} the relative path string.
   */
  function getRelativeParentPath(path: string, offset?: number, slash?: boolean): string;

  /**
   Returns a relative path string using the path provided
   @method getRelativePath
   @param {String} path The path to relatively get to.
   @return {String} the relative path string.
   */
  function getRelativePath(path: string, offset?: number): string;
}

export = PathUtils;
